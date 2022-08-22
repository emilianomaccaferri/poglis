"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validConf = void 0;
const type_validations_1 = require("@altostra/type-validations");
const primitives_1 = require("@altostra/type-validations/lib/primitives");
exports.validConf = (0, type_validations_1.objectOf)({
    name: primitives_1.string,
    route: primitives_1.string,
    method: (0, type_validations_1.enumOf)('get', 'post')
});
