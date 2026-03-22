DOCKERHUB_USER := jaimehenao8126
API_IMAGE      := $(DOCKERHUB_USER)/bills-api
WEB_IMAGE      := $(DOCKERHUB_USER)/bills-web
TAG            := latest

.PHONY: build push up down logs clean

## Build both images locally
build:
	docker build -f apps/api/Dockerfile -t $(API_IMAGE):$(TAG) .
	docker build -f apps/web/Dockerfile -t $(WEB_IMAGE):$(TAG) \
	  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1 \
	  --build-arg NEXTAUTH_URL=http://localhost:3000 .

## Push both images to DockerHub (docker login first)
push: build
	docker push $(API_IMAGE):$(TAG)
	docker push $(WEB_IMAGE):$(TAG)

## Start all 4 services (builds if images are missing)
up:
	docker compose up -d --build

## Stop and remove containers
down:
	docker compose down

## Follow logs for all services
logs:
	docker compose logs -f

## Remove containers, volumes, and local images
clean:
	docker compose down -v --rmi local
