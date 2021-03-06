const { Http404Error } = require('../errors');

const detectRatePlans = (roomTypeId, ratePlansObject) => {
  for (let ratePlanId in ratePlansObject) {
    ratePlansObject[ratePlanId].id = ratePlanId;
  }
  return Object.values(ratePlansObject)
    .filter((rp) => rp.roomTypeIds && rp.roomTypeIds.indexOf(roomTypeId) > -1)
    .reduce((result, plan) => {
      result[plan.id] = plan;
      return result;
    }, {});
};

const getPlainHotel = async (hotel, fieldsQuery) => {
  fieldsQuery = fieldsQuery.filter((x) => !!x);
  const resolvedFields = ['descriptionUri.roomTypes'];
  if (fieldsQuery.indexOf('ratePlans') > -1) {
    resolvedFields.push('ratePlansUri');
  }
  return hotel.toPlainObject(resolvedFields);
};

const findAll = async (req, res, next) => {
  const fieldsQuery = (req.query.fields && req.query.fields.split(',')) || [];
  try {
    const plainHotel = await getPlainHotel(res.locals.wt.hotel, fieldsQuery);
    let roomTypes = plainHotel.dataUri.contents.descriptionUri.contents.roomTypes;
    for (let roomTypeId in roomTypes) {
      roomTypes[roomTypeId].id = roomTypeId;
      if (fieldsQuery.indexOf('ratePlans') > -1) {
        roomTypes[roomTypeId].ratePlans = detectRatePlans(roomTypeId, plainHotel.dataUri.contents.ratePlansUri.contents);
      }
    }
    res.status(200).json(roomTypes);
  } catch (e) {
    next(e);
  }
};

const find = async (req, res, next) => {
  let { roomTypeId } = req.params;
  const fieldsQuery = (req.query.fields && req.query.fields.split(',')) || [];
  try {
    const plainHotel = await getPlainHotel(res.locals.wt.hotel, fieldsQuery);
    let roomTypes = plainHotel.dataUri.contents.descriptionUri.contents.roomTypes;
    let roomType = roomTypes[roomTypeId];
    if (!roomType) {
      return next(new Http404Error('roomTypeNotFound', 'Room type not found'));
    }
    roomType.id = roomTypeId;
    if (fieldsQuery.indexOf('ratePlans') > -1) {
      roomType.ratePlans = detectRatePlans(roomTypeId, plainHotel.dataUri.contents.ratePlansUri.contents);
    }
    res.status(200).json(roomType);
  } catch (e) {
    next(e);
  }
};

const findRatePlans = async (req, res, next) => {
  let { roomTypeId } = req.params;
  try {
    let plainHotel = await res.locals.wt.hotel.toPlainObject(['ratePlansUri']);
    const ratePlans = detectRatePlans(roomTypeId, plainHotel.dataUri.contents.ratePlansUri.contents);
    res.status(200).json(ratePlans);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  findAll,
  find,
  findRatePlans,
};
