const { handleApplicationError } = require('../errors');

const findAll = async (req, res, next) => {
  try {
    let hotels = await req.wt.index.getAllHotels();
    let rawHotels = [];
    for (let hotel of hotels) {
      rawHotels.push(await hotel.toPlainObject());
    }
    res.status(200).json({ hotels: rawHotels });
  } catch (e) {
    next(e);
  }
};

const find = async (req, res, next) => {
  const { hotelAddress } = req.params;
  try {
    let hotel = await req.wt.index.getHotel(hotelAddress);
    return res.status(200).json({ hotel: await hotel.toPlainObject() });
  } catch (e) {
    if (e.message.match(/cannot find hotel/i)) {
      return next(handleApplicationError('hotelNotFound', e));
    }
    next(e);
  }
};

const create = async (req, res, next) => {
  const { name, description, manager, location } = req.body;
  if (!manager) {
    return next(handleApplicationError('missingManager'));
  }
  try {
    const result = await req.wt.index.addHotel(req.wt.wallet, { name, description, manager, location });
    res.status(202).json(result);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  const { url, name, description } = req.body;
  const { hotelAddress } = req.params;
  try {
    const hotel = await req.wt.index.getHotel(hotelAddress);
    if (url) {
      hotel.url = url;
    }
    if (name) {
      hotel.name = name;
    }
    if (description) {
      hotel.description = description;
    }

    const transactionIds = await req.wt.index.updateHotel(req.wt.wallet, hotel);
    res.status(202).json({ transactionIds });
  } catch (e) {
    if (e.message.match(/cannot find hotel/i)) {
      return next(handleApplicationError('hotelNotFound', e));
    }
    if (e.message.match(/transaction originator/i)) {
      return next(handleApplicationError('managerWalletMismatch', e));
    }
    next(e);
  }
};

const remove = async (req, res, next) => {
  const { hotelAddress } = req.params;
  try {
    const hotel = await req.wt.index.getHotel(hotelAddress);
    const transactionIds = await req.wt.index.removeHotel(req.wt.wallet, hotel);
    res.status(202).json({ transactionIds });
  } catch (e) {
    if (e.message.match(/cannot find hotel/i)) {
      return next(handleApplicationError('hotelNotFound', e));
    }
    if (e.message.match(/transaction originator/i)) {
      return next(handleApplicationError('managerWalletMismatch', e));
    }
    next(e);
  }
};

module.exports = {
  create,
  find,
  findAll,
  remove,
  update,
};
