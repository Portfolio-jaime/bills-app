#!/usr/bin/env bash
# k8s/deploy.sh — Deploy Bills App to a local kind cluster
# ──────────────────────────────────────────────────────────
# Usage:
#   chmod +x k8s/deploy.sh
#   ./k8s/deploy.sh
#
# Requirements:
#   - kind    (brew install kind)
#   - kubectl (brew install kubectl)
#   - docker  (Docker Desktop or OrbStack)

set -euo pipefail

CLUSTER_NAME="bills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "══════════════════════════════════════════"
echo "  Bills App — Kind Cluster Setup"
echo "══════════════════════════════════════════"

# ── 1. Create kind cluster ─────────────────────────────────────────────────
if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "✓ Kind cluster '${CLUSTER_NAME}' already exists"
else
  echo "→ Creating kind cluster '${CLUSTER_NAME}'..."
  kind create cluster --name "$CLUSTER_NAME" --config "$SCRIPT_DIR/kind-config.yaml"
  echo "✓ Cluster created"
fi

# ── 2. Set kubectl context ─────────────────────────────────────────────────
kubectl config use-context "kind-${CLUSTER_NAME}"
echo "✓ kubectl context set to kind-${CLUSTER_NAME}"

# ── 3. Install Nginx Ingress ───────────────────────────────────────────────
echo "→ Installing nginx-ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
echo "✓ Nginx Ingress ready"

# ── 4. Build Docker images ─────────────────────────────────────────────────
echo "→ Building bills-api Docker image..."
docker build -f "$ROOT_DIR/apps/api/Dockerfile" -t bills-api:latest "$ROOT_DIR"

echo "→ Building bills-web Docker image..."
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost/api/v1 \
  --build-arg NEXTAUTH_URL=http://localhost \
  -f "$ROOT_DIR/apps/web/Dockerfile" \
  -t bills-web:latest \
  "$ROOT_DIR"

echo "✓ Images built"

# ── 5. Load images into kind ───────────────────────────────────────────────
echo "→ Loading images into kind cluster..."
kind load docker-image bills-api:latest --name "$CLUSTER_NAME"
kind load docker-image bills-web:latest --name "$CLUSTER_NAME"
echo "✓ Images loaded"

# ── 6. Apply manifests ─────────────────────────────────────────────────────
echo "→ Applying Kubernetes manifests..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"
kubectl apply -f "$SCRIPT_DIR/secrets.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres.yaml"
kubectl apply -f "$SCRIPT_DIR/redis.yaml"

# Wait for postgres before deploying api
echo "→ Waiting for PostgreSQL to be ready..."
kubectl rollout status statefulset/bills-postgres -n bills --timeout=120s

kubectl apply -f "$SCRIPT_DIR/api.yaml"
kubectl apply -f "$SCRIPT_DIR/web.yaml"
kubectl apply -f "$SCRIPT_DIR/ingress.yaml"

# ── 7. Wait for rollouts ───────────────────────────────────────────────────
echo "→ Waiting for API rollout..."
kubectl rollout status deployment/bills-api -n bills --timeout=180s

echo "→ Waiting for Web rollout..."
kubectl rollout status deployment/bills-web -n bills --timeout=120s

# ── 8. Summary ─────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Bills App deployed to kind!"
echo ""
echo "  Web:     http://localhost"
echo "  API:     http://localhost/api/v1"
echo "  Swagger: http://localhost/api/docs"
echo ""
echo "  Via NodePort:"
echo "  Web:     http://localhost:3000"
echo "  API:     http://localhost:3002"
echo ""
echo "  Pods:"
kubectl get pods -n bills
echo "══════════════════════════════════════════"
