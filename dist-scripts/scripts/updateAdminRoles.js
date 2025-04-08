"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminRoles = void 0;
var client_1 = require("../src/integrations/supabase/client");
/**
 * This script updates all existing users to have admin role
 * Run with: ts-node scripts/updateAdminRoles.ts
 */
var updateAdminRoles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, users, usersError, _i, _b, user, updateError, _c, profile, profileError, insertError, updateProfileError, err_1;
    var _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 10, 11, 12]);
                console.log("Fetching all users...");
                return [4 /*yield*/, client_1.supabase.auth.admin.listUsers()];
            case 1:
                _a = _g.sent(), users = _a.data, usersError = _a.error;
                if (usersError) {
                    console.error("Error fetching users:", usersError);
                    return [2 /*return*/];
                }
                console.log("Found ".concat(users.users.length, " users"));
                _i = 0, _b = users.users;
                _g.label = 2;
            case 2:
                if (!(_i < _b.length)) return [3 /*break*/, 9];
                user = _b[_i];
                console.log("Updating user ".concat(user.email, " to admin role..."));
                return [4 /*yield*/, client_1.supabase.auth.admin.updateUserById(user.id, { user_metadata: __assign(__assign({}, user.user_metadata), { role: 'admin' }) })];
            case 3:
                updateError = (_g.sent()).error;
                if (updateError) {
                    console.error("Error updating user ".concat(user.email, ":"), updateError);
                    return [3 /*break*/, 8];
                }
                return [4 /*yield*/, client_1.supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()];
            case 4:
                _c = _g.sent(), profile = _c.data, profileError = _c.error;
                if (!profileError) return [3 /*break*/, 6];
                console.log("Creating new admin profile for user ".concat(user.email));
                return [4 /*yield*/, client_1.supabase
                        .from('profiles')
                        .insert({
                        id: user.id,
                        full_name: ((_d = user.user_metadata) === null || _d === void 0 ? void 0 : _d.full_name) || ((_e = user.email) === null || _e === void 0 ? void 0 : _e.split('@')[0]) || null,
                        phone: ((_f = user.user_metadata) === null || _f === void 0 ? void 0 : _f.phone) || null,
                        role: 'admin' // Set to admin role
                    })];
            case 5:
                insertError = (_g.sent()).error;
                if (insertError) {
                    console.error("Error creating profile for user ".concat(user.email, ":"), insertError);
                }
                else {
                    console.log("Created admin profile for user ".concat(user.email));
                }
                return [3 /*break*/, 8];
            case 6:
                console.log("Updating existing profile for user ".concat(user.email));
                return [4 /*yield*/, client_1.supabase
                        .from('profiles')
                        .update({ role: 'admin' })
                        .eq('id', user.id)];
            case 7:
                updateProfileError = (_g.sent()).error;
                if (updateProfileError) {
                    console.error("Error updating profile for user ".concat(user.email, ":"), updateProfileError);
                }
                else {
                    console.log("Updated profile for user ".concat(user.email, " to admin role"));
                }
                _g.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 2];
            case 9:
                console.log("Finished updating all users to admin role");
                return [3 /*break*/, 12];
            case 10:
                err_1 = _g.sent();
                console.error("Error in updateAdminRoles:", err_1);
                return [3 /*break*/, 12];
            case 11:
                process.exit(0);
                return [7 /*endfinally*/];
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.updateAdminRoles = updateAdminRoles;
// Run the script if this file is executed directly
if (require.main === module) {
    updateAdminRoles().catch(console.error);
}
