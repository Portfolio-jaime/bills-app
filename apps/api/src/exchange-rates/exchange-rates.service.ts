import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'

const SUPPORTED_PAIRS = [
  ['USD', 'COP'],
  ['EUR', 'COP'],
  ['GBP', 'COP'],
  ['BTC', 'USD'],
  ['ETH', 'USD'],
  ['EUR', 'USD'],
  ['GBP', 'USD'],
]

const BASE_API_URL = 'https://open.er-api.com/v6/latest'

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name)

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncRates() {
    this.logger.log('Syncing exchange rates…')
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Fetch USD base rates (covers most pairs)
    try {
      const res = await fetch(`${BASE_API_URL}/USD`)
      if (!res.ok) {
        this.logger.warn(`Exchange rate API returned ${res.status}`)
        return
      }
      const data = (await res.json()) as { rates: Record<string, number> }

      const upserts = SUPPORTED_PAIRS.map(([from, to]) => {
        let rate: number

        if (from === 'USD') {
          rate = data.rates[to]
        } else if (to === 'USD') {
          rate = 1 / data.rates[from]
        } else {
          // Cross-rate via USD
          const fromToUsd = 1 / data.rates[from]
          rate = fromToUsd * data.rates[to]
        }

        if (!rate || !isFinite(rate)) return null

        return this.prisma.exchangeRate.upsert({
          where: { fromCurrency_toCurrency_date: { fromCurrency: from, toCurrency: to, date: today } },
          create: { fromCurrency: from, toCurrency: to, rate, date: today },
          update: { rate },
        })
      }).filter(Boolean)

      await Promise.all(upserts)
      this.logger.log(`Exchange rates synced: ${upserts.length} pairs`)
    } catch (err) {
      this.logger.error('Failed to sync exchange rates', err)
    }
  }

  async getRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    if (fromCurrency === toCurrency) return 1

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    for (let i = 0; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const er = await this.prisma.exchangeRate.findUnique({
        where: { fromCurrency_toCurrency_date: { fromCurrency, toCurrency, date } },
      })
      if (er) return Number(er.rate)
    }
    return null
  }
}
