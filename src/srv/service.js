const express = require('express')
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express')
const app = express()
const config = require('../../config')

const { unitTypesRouter } = require('./routes/unit-types')
const { amenitiesRouter } = require('./routes/amenities')
const { unitsRouter } = require('./routes/units')
const { walletRouter } = require('./routes/wallet')
const { hotelImagesRouter } = require('./routes/hotel-images')
const { hotelsRouter } = require('./routes/hotels')
const { bookingRouter } = require('./routes/booking')
const { defaultPricesRouter } = require('./routes/default-prices')
const { specialPricesRouter } = require('./routes/special-prices')
const { costsRouter } = require('./routes/booking-data/costs')
const { hotelBookingRouter } = require('./routes/hotel-bookings')

app.use('/docs', swaggerUi.serve, swaggerUi.setup(require('../../docs/swagger.json')))
app.use(bodyParser.json())
app.use(unitTypesRouter)
app.use(amenitiesRouter)
app.use(unitsRouter)
app.use(walletRouter)
app.use(hotelImagesRouter)
app.use(hotelBookingRouter)
app.use(hotelsRouter)
app.use(defaultPricesRouter)
app.use(specialPricesRouter)
app.use(costsRouter)
app.use(bookingRouter)

app.use((err, req, res, next) => {
  res.status(400).json({
    code: err.code,
    short: err.short,
    long: err.long
  })
  if (config.get('log')) console.error(err)
})

app.use('/', (req, res) => {
  res.write('WT Nodejs API')
  res.end()
})

module.exports = {
  app
}
