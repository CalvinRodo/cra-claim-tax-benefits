const request = require('supertest')
const app = require('../../app.js')

describe('Test /deductions responses', () => {
  describe('Test /deductions/* yesNo responses', () => {
    const yesNoResponses = [
      {
        url: '/trillium/rent',
        key: 'trilliumRentClaim',
      },
      {
        url: '/trillium/propertyTax',
        key: 'trilliumPropertyTaxClaim',
      },
      {
        url: '/trillium/studentResidence',
        key: 'trilliumStudentResidence',
        yesRedir: '/start',
      },
      {
        url: '/trillium/energy/cost',
        key: 'trilliumEnergyCostClaim',
      },
      {
        url: '/trillium/longTermCare/type',
        key: 'trilliumLongTermCareTypeClaim',
      },
      {
        url: '/deductions/climate-action-incentive',
        key: 'climateActionIncentiveIsRural',
        yesRedir: '/start',
      },
    ]

    yesNoResponses.map(yesNoResponse => {
      describe(`Test ${yesNoResponse.url} responses`, () => {
        test('it returns a 200 response', async () => {
          const response = await request(app).get(yesNoResponse.url)
          expect(response.statusCode).toBe(200)
        })

        test('it returns a 422 response for no posted value', async () => {
          const response = await request(app)
            .post(yesNoResponse.url)
            .send({ redirect: '/start' })
          expect(response.statusCode).toBe(422)
        })

        const badValues = ['', null, false, 0, 'dinosaur', 'yes']
        badValues.map(badValue => {
          test(`it returns a 422 for a bad posted value: "${badValue}"`, async () => {
            const response = await request(app)
              .post(yesNoResponse.url)
              .send({ [yesNoResponse.key]: badValue, redirect: '/start' })
            expect(response.statusCode).toBe(422)
          })
        })

        test('it redirects to the posted redirect url when posting "No"', async () => {
          const response = await request(app)
            .post(yesNoResponse.url)
            .send({ [yesNoResponse.key]: 'No', redirect: '/start' })
          expect(response.statusCode).toBe(302)
          expect(response.headers.location).toEqual('/start')
        })

        test('it redirects to the checkAnswers when posting "No" and having come from the checkAnswers page', async () => {
          const response = await request(app)
            .post(`${yesNoResponse.url}`)
            .query({ ref: 'checkAnswers' })
            .send({ [yesNoResponse.key]: 'No', redirect: '/start' })
          expect(response.statusCode).toBe(302)
          expect(response.headers.location).toEqual('/checkAnswers')
        })

        test('it redirects to the amount page with checkAnswers ref when posting "Yes" and having come from the checkAnswers page', async () => {
          const response = await request(app)
            .post(yesNoResponse.url)
            .query({ ref: 'checkAnswers' })
            .send({ [yesNoResponse.key]: 'Yes', redirect: '/start' })
          expect(response.statusCode).toBe(302)
          if ('yesRedir' in yesNoResponse) {
            expect(response.headers.location).toEqual('/checkAnswers')
          } else {
            expect(response.headers.location).toEqual(
              `${yesNoResponse.url}/amount?ref=checkAnswers`,
            )
          }
        })

        test('it redirects to the edit page when posting "Yes"', async () => {
          const response = await request(app)
            .post(yesNoResponse.url)
            .send({ [yesNoResponse.key]: 'Yes', redirect: yesNoResponse.yesRedir || '/' })
          expect(response.statusCode).toBe(302)
          expect(response.headers.location).toEqual(
            yesNoResponse.yesRedir || `${yesNoResponse.url}/amount`,
          )
        })
      })
    })
  })

  describe('Test /trillium/energy/reserve responses', () => {
    test('it returns a 422 with no option selected', async () => {
      const response = await request(app).post('/trillium/energy/reserve')
      expect(response.statusCode).toBe(422)
    })

    test('it redirects to the provided redirect value page when selecting No', async () => {
      const response = await request(app)
        .post('/trillium/energy/reserve')
        .send({ trilliumEnergyReserveClaim: 'No', redirect: '/start' })
      expect(response.headers.location).toEqual('/start')
      expect(response.statusCode).toBe(302)
    })

    test('it redirects to "/trillium/energy/cost" when selecting Yes', async () => {
      const response = await request(app)
        .post('/trillium/energy/reserve')
        .send({ trilliumEnergyReserveClaim: 'Yes' })
      expect(response.headers.location).toEqual('/trillium/energy/cost')
      expect(response.statusCode).toBe(302)
    })

    test('it redirects with the checkAnswers ref when posting Yes and having come from the checkAnswers page', async () => {
      const response = await request(app)
        .post('/trillium/energy/reserve')
        .query({ ref: 'checkAnswers' })
        .send({ trilliumEnergyReserveClaim: 'Yes' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual('/trillium/energy/cost?ref=checkAnswers')
    })
  })

  describe('Test /trillium/longTermCare responses', () => {
    test('it returns a 422 with no option selected', async () => {
      const response = await request(app).post('/trillium/longTermCare')
      expect(response.statusCode).toBe(422)
    })

    test('it redirects to the provided redirect value when selecting No', async () => {
      const response = await request(app)
        .post('/trillium/longTermCare')
        .send({ trilliumLongTermCareClaim: 'No', redirect: '/start' })
      expect(response.headers.location).toEqual('/start')
      expect(response.statusCode).toBe(302)
    })

    test('it redirects to "/trillium/longTermCare/type" when selecting Yes', async () => {
      const response = await request(app)
        .post('/trillium/longTermCare')
        .send({ trilliumLongTermCareClaim: 'Yes' })
      expect(response.headers.location).toEqual('/trillium/longTermCare/type')
      expect(response.statusCode).toBe(302)
    })

    test('it redirects with the checkAnswers ref when posting Yes and having come from the checkAnswers page', async () => {
      const response = await request(app)
        .post('/trillium/longTermCare')
        .query({ ref: 'checkAnswers' })
        .send({ trilliumLongTermCareClaim: 'Yes' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual('/trillium/longTermCare/type?ref=checkAnswers')
    })
  })

  describe('Test /deductions/*/amount responses', () => {
    const amountReponses = [
      {
        url: '/trillium/rent/amount',
        key: 'trilliumRentAmount',
      },
      {
        url: '/trillium/propertyTax/amount',
        key: 'trilliumPropertyTaxAmount',
      },
      {
        url: '/trillium/energy/cost/amount',
        key: 'trilliumEnergyAmount',
      },
      {
        url: '/trillium/longTermCare/type/amount',
        key: 'trilliumLongTermCareAmount',
      },
    ]

    amountReponses.map(amountResponse => {
      describe(`Test ${amountResponse.url} responses`, () => {
        test('it returns a 200 response', async () => {
          const response = await request(app).get(amountResponse.url)
          expect(response.statusCode).toBe(200)
        })

        test('it returns a 500 response if no redirect is provided', async () => {
          const response = await request(app).post(amountResponse.url)
          expect(response.statusCode).toBe(500)
        })

        test('it returns a 302 response for no posted value', async () => {
          const response = await request(app)
            .post(amountResponse.url)
            .send({ redirect: '/start' })
          expect(response.statusCode).toBe(302)
          expect(response.headers.location).toEqual('/start')
        })

        const badAmounts = ['dinosaur', '10.0', '10.000', '-10', '.1']
        badAmounts.map(badAmount => {
          test(`it returns a 422 for a bad posted value: "${badAmount}"`, async () => {
            const response = await request(app)
              .post(amountResponse.url)
              .send({ [amountResponse.key]: badAmount, redirect: '/start' })
            expect(response.statusCode).toBe(422)
          })
        })

        const goodAmounts = ['0', '10', '10.00', '.10', '', null]
        goodAmounts.map(goodAmount => {
          test(`it returns a 302 for a good posted value: "${goodAmount}"`, async () => {
            const response = await request(app)
              .post(amountResponse.url)
              .send({ [amountResponse.key]: goodAmount, redirect: '/start' })
            expect(response.statusCode).toBe(302)
            expect(response.headers.location).toEqual('/start')
          })
        })
      })
    })
  })
})
