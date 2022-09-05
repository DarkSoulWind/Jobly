"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.getUserNodeByID = exports.Edge = exports.GraphNode = void 0;
var prisma_1 = require("./prisma");
// we make it abstract because we only want this class to be inherited but not instantiated
var Unit = /** @class */ (function () {
    function Unit(entity, properties) {
        this.entity = entity;
        this.properties = properties;
    }
    Unit.prototype.load = function (properties) {
        this.properties = __assign({}, properties);
        return this;
    };
    Unit.prototype.set = function (property, value) {
        this.properties[property] = value;
    };
    Unit.prototype.unset = function (property) {
        this.properties[property] = undefined;
    };
    Unit.prototype.has = function (property) {
        return Object.prototype.hasOwnProperty.call(this.properties, property);
    };
    Unit.prototype.get = function (property) {
        return this.properties[property];
    };
    Unit.prototype.toString = function () {
        return "{\"type\": \"".concat(this.entity, "\", \"properties\": ").concat(JSON.stringify(this.properties, null, 4), "}");
    };
    return Unit;
}());
var GraphNode = /** @class */ (function (_super) {
    __extends(GraphNode, _super);
    function GraphNode(entity, properties) {
        if (properties === void 0) { properties = {}; }
        var _this = _super.call(this, entity, properties) || this;
        _this.edges = [];
        _this.inputEdges = [];
        _this.outputEdges = [];
        return _this;
    }
    GraphNode.prototype.unlink = function () {
        for (var _i = 0, _a = this.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            edge.unlink();
        }
    };
    GraphNode.prototype.toString = function () {
        return "{\"type\": \"".concat(this.entity, "\", \"properties\": ").concat(JSON.stringify(this.properties, null, 4), " }");
    };
    return GraphNode;
}(Unit));
exports.GraphNode = GraphNode;
var Edge = /** @class */ (function (_super) {
    __extends(Edge, _super);
    function Edge(entity, properties) {
        if (properties === void 0) { properties = {}; }
        var _this = _super.call(this, entity, properties) || this;
        _this._inputNode = null;
        _this._outputNode = null;
        _this.duplex = false;
        _this._distance = 1;
        return _this;
    }
    Object.defineProperty(Edge.prototype, "inputNode", {
        get: function () {
            return this._inputNode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Edge.prototype, "outputNode", {
        get: function () {
            return this._outputNode;
        },
        enumerable: false,
        configurable: true
    });
    // link a specific node in a certain direction
    Edge.prototype.linkTo = function (node, direction) {
        // if direction is -1, then edge points to input node
        if (direction <= 0)
            node === null || node === void 0 ? void 0 : node.inputEdges.push(this);
        // if direction is 1, then edge points to output node
        if (direction >= 0)
            node === null || node === void 0 ? void 0 : node.outputEdges.push(this);
        // if direction is 0 then the edge is duplex (undirected)
        node === null || node === void 0 ? void 0 : node.edges.push(this);
    };
    // link two nodes, optionally make edge duplex (undirected)
    Edge.prototype.link = function (inputNode, outputNode, duplex) {
        if (duplex === void 0) { duplex = false; }
        this.unlink();
        this._inputNode = inputNode;
        this._outputNode = outputNode;
        this.duplex = duplex;
        this.linkTo(inputNode, duplex ? 0 : 1);
        this.linkTo(outputNode, duplex ? 0 : -1);
        return this;
    };
    Object.defineProperty(Edge.prototype, "distance", {
        // distance for traversal
        set: function (value) {
            this._distance = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Edge.prototype, "weight", {
        // weight is 1 / distance
        set: function (value) {
            this._distance = 1 / value;
        },
        enumerable: false,
        configurable: true
    });
    // find the opposite node given a starting node
    Edge.prototype.oppositeNode = function (node) {
        if (this._inputNode === node)
            return this._outputNode;
        else if (this._outputNode === node)
            return this._inputNode;
        return null;
    };
    // remove connections from nodes
    Edge.prototype.unlink = function () {
        var pos;
        var inode = this._inputNode;
        var onode = this._outputNode;
        if (!(inode && onode))
            return;
        (pos = inode.edges.indexOf(this)) > -1 && inode.edges.splice(pos, 1);
        (pos = onode.edges.indexOf(this)) > -1 && onode.edges.splice(pos, 1);
        (pos = inode.outputEdges.indexOf(this)) > -1 &&
            inode.outputEdges.splice(pos, 1);
        (pos = onode.inputEdges.indexOf(this)) > -1 &&
            onode.inputEdges.splice(pos, 1);
        if (this.duplex) {
            (pos = inode.inputEdges.indexOf(this)) > -1 &&
                inode.inputEdges.splice(pos, 1);
            (pos = onode.outputEdges.indexOf(this)) > -1 &&
                onode.outputEdges.splice(pos, 1);
        }
        this._inputNode = null;
        this._outputNode = null;
        this.duplex = false;
    };
    Edge.prototype.toString = function () {
        var _a, _b;
        return "\n".concat(this.constructor.name, " (").concat(this.entity, " ").concat(JSON.stringify(this.properties, null, 4), ",\n Input node: ").concat((_a = this._inputNode) === null || _a === void 0 ? void 0 : _a.toString(), ",\n Output node: ").concat((_b = this._outputNode) === null || _b === void 0 ? void 0 : _b.toString());
    };
    return Edge;
}(Unit));
exports.Edge = Edge;
var getUserNodeByID = function (nodes, id) {
    return nodes.find(function (node) { return node.get("id") === id; });
};
exports.getUserNodeByID = getUserNodeByID;
function BFS(root) {
    var visited = new Set();
    var queue = [root];
    console.log("starting from", root.toString());
    while (queue.length > 0) {
        var poppedNode = queue.shift();
        var linkedEdges = poppedNode.edges;
        for (var _i = 0, linkedEdges_1 = linkedEdges; _i < linkedEdges_1.length; _i++) {
            var edge = linkedEdges_1[_i];
            var outputNode = edge.outputNode;
            if (!visited.has(outputNode)) {
                visited.add(outputNode);
                queue.push(outputNode);
                console.log(outputNode === null || outputNode === void 0 ? void 0 : outputNode.toString());
            }
        }
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, userNodes, followEdges, postLikeEdges;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.prisma.user.findMany({
                        select: {
                            name: true,
                            id: true,
                            following: {
                                select: {
                                    following: {
                                        select: { name: true, id: true }
                                    }
                                }
                            },
                            postLikes: {
                                select: {
                                    User: {
                                        select: {
                                            password: false,
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        },
                        take: 50
                    })];
                case 1:
                    users = _a.sent();
                    userNodes = users.map(function (user) { return new GraphNode("user", __assign({}, user)); });
                    followEdges = userNodes.flatMap(function (userNode) {
                        return userNode
                            .get("Following")
                            .map(function (_a) {
                            var following = _a.following;
                            return new Edge("follow").link(userNode, (0, exports.getUserNodeByID)(userNodes, following.id));
                        });
                    });
                    postLikeEdges = userNodes.flatMap(function (userNode) {
                        return userNode
                            .get("PostLikes")
                            .map(function (_a) {
                            var User = _a.User;
                            return new Edge("post-like").link(userNode, (0, exports.getUserNodeByID)(userNodes, User.id));
                        });
                    });
                    BFS(userNodes[0]);
                    return [2 /*return*/];
            }
        });
    });
}
main();
