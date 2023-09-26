import { it, beforeAll, describe, afterAll, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'
import { afterEach } from 'node:test'

describe('Transaction Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:latest')
  })

  afterAll(() => {
    execSync('npm run knex migrate:rollback --all')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })
  it('should be able to list all transactions', async () => {
    const createdTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createdTransaction.get('Set-Cookie')

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('transactions')
    expect(response.body.transactions).toEqual([
      expect.objectContaining({ title: 'New Transaction', amount: 5000 }),
    ])
  })
  it('should be able to get a transactions', async () => {
    const createdTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createdTransaction.get('Set-Cookie')

    const { body: listTransacitons } = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
    const transactionId = listTransacitons.transactions[0].id

    const response = await await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('transaction')
    expect(response.body.transaction).toEqual(
      expect.objectContaining({ title: 'New Transaction', amount: 5000 }),
    )
  })

  it('should be able to get the summary', async () => {
    const createdTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createdTransaction.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)

      .send({
        title: 'Debit Transaction',
        amount: 5000,
        type: 'debit',
      })

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('summary')
    expect(response.body.summary.amount).toBe(0)
  })
})
