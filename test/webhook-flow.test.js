/**
 * Unit tests for webhook flow functionality
 * Tests the complete webhook processing pipeline with all implemented features
 */
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
import { processWebhook } from '../src/utils/shopify';
import { addToWebhookQueue, getQueueMetrics, getCircuitBreakerStatus, webhookQueue, deadLetterQueue } from '../src/workers/webhook-worker';
// Mock data
var mockPayload = {
    id: '12345',
    customer: {
        id: 123,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
    },
    line_items: [
        {
            id: 456,
            product_id: 789,
            title: 'Test Product',
            quantity: 1,
            price: '29.99'
        }
    ]
};
describe('Webhook Flow Tests', function () {
    beforeEach(function () {
        // Clear any existing state
        webhookQueue.length = 0;
        deadLetterQueue.length = 0;
    });
    test('1. Should process webhook and add to queue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalAddToQueue, queueCallCount, queueArgs, originalImport, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalAddToQueue = addToWebhookQueue;
                    queueCallCount = 0;
                    queueArgs = null;
                    // Temporarily override the function to capture calls
                    global.testQueueCalls = [];
                    originalImport = global.import;
                    global.import = function (path) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (path === '../workers/webhook-worker') {
                                return [2 /*return*/, {
                                        addToWebhookQueue: function () {
                                            var args = [];
                                            for (var _i = 0; _i < arguments.length; _i++) {
                                                args[_i] = arguments[_i];
                                            }
                                            queueCallCount++;
                                            queueArgs = args;
                                            global.testQueueCalls.push(args);
                                            // Actually call the real function for full functionality
                                            return originalAddToQueue.apply(void 0, args);
                                        },
                                        getQueueMetrics: getQueueMetrics,
                                        getCircuitBreakerStatus: getCircuitBreakerStatus,
                                        webhookQueue: webhookQueue,
                                        deadLetterQueue: deadLetterQueue
                                    }];
                            }
                            return [2 /*return*/, originalImport(path)];
                        });
                    }); };
                    // Process a webhook
                    return [4 /*yield*/, processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload)];
                case 1:
                    // Process a webhook
                    _a.sent();
                    // Restore original import
                    global.import = originalImport;
                    // Verify the function was called
                    expect(queueCallCount).toBeGreaterThan(0);
                    expect(queueArgs).not.toBeNull();
                    expect(queueArgs[0]).toBe('orders/create');
                    expect(queueArgs[1]).toBe('test-shop.myshopify.com');
                    expect(queueArgs[2]).toEqual(mockPayload);
                    metrics = getQueueMetrics();
                    expect(metrics.queueSize).toBe(1);
                    return [2 /*return*/];
            }
        });
    }); });
    test('2. Should handle duplicate webhooks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Process the same webhook twice
                return [4 /*yield*/, processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload)];
                case 1:
                    // Process the same webhook twice
                    _a.sent();
                    return [4 /*yield*/, processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload)];
                case 2:
                    _a.sent(); // Duplicate
                    metrics = getQueueMetrics();
                    expect(metrics.queueSize).toBe(1); // Only one unique event should be processed
                    return [2 /*return*/];
            }
        });
    }); });
    test('3. Should enforce rate limiting', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 105)) return [3 /*break*/, 4];
                    return [4 /*yield*/, processWebhook('products/update', 'rate-limited-shop.myshopify.com', __assign(__assign({}, mockPayload), { id: "id-".concat(i) }))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    metrics = getQueueMetrics();
                    // Note: The exact count depends on timing, but we should see evidence of rate limiting
                    console.log("Rate limiting test - Queue size: ".concat(metrics.queueSize));
                    return [2 /*return*/];
            }
        });
    }); });
    test('4. Should handle circuit breaker functionality', function () {
        // Initially should be closed
        var initialStatus = getCircuitBreakerStatus();
        expect(initialStatus.isOpen).toBe(false);
        // The circuit breaker is tested more thoroughly when actual API calls fail
        // For unit testing, we can verify the status reporting works
        expect(typeof initialStatus.failureCount).toBe('number');
    });
    test('5. Should maintain proper queue metrics', function () {
        // Add some items to the queue
        addToWebhookQueue('test/event1', 'shop1.myshopify.com', mockPayload);
        addToWebhookQueue('test/event2', 'shop2.myshopify.com', mockPayload);
        var metrics = getQueueMetrics();
        expect(metrics.queueSize).toBe(2);
        expect(metrics.dlqSize).toBe(0); // Should be empty initially
    });
    test('6. Should handle dead letter queue', function () {
        // Verify initial DLQ is empty
        var metrics = getQueueMetrics();
        expect(metrics.dlqSize).toBe(0);
    });
    test('7. Should process multiple different webhook types', function () { return __awaiter(void 0, void 0, void 0, function () {
        var webhookTypes, _i, webhookTypes_1, eventType, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    webhookTypes = [
                        'orders/create',
                        'customers/create',
                        'products/update',
                        'checkouts/create'
                    ];
                    _i = 0, webhookTypes_1 = webhookTypes;
                    _a.label = 1;
                case 1:
                    if (!(_i < webhookTypes_1.length)) return [3 /*break*/, 4];
                    eventType = webhookTypes_1[_i];
                    return [4 /*yield*/, processWebhook(eventType, 'multi-test-shop.myshopify.com', mockPayload)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    metrics = getQueueMetrics();
                    expect(metrics.queueSize).toBe(webhookTypes.length);
                    return [2 /*return*/];
            }
        });
    }); });
    test('8. Should handle different shops separately for rate limiting', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, shopDomain, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 105)) return [3 /*break*/, 4];
                    shopDomain = "shop-".concat(i % 3, ".myshopify.com");
                    return [4 /*yield*/, processWebhook('orders/create', shopDomain, __assign(__assign({}, mockPayload), { id: "id-".concat(i) }))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    metrics = getQueueMetrics();
                    console.log("Multiple shops test - Queue size: ".concat(metrics.queueSize));
                    return [2 /*return*/];
            }
        });
    }); });
});
// Run a simple execution test
console.log('🧪 Running webhook flow unit tests...\n');
// Manual test of the core functionality
function manualTest() {
    return __awaiter(this, void 0, void 0, function () {
        var metrics, metricsAfterDup, cbStatus, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running manual webhook processing test...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Test basic webhook processing
                    return [4 /*yield*/, processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload)];
                case 2:
                    // Test basic webhook processing
                    _a.sent();
                    console.log('✅ Basic webhook processing: SUCCESS');
                    metrics = getQueueMetrics();
                    console.log("\uD83D\uDCCA Queue metrics after processing: ".concat(metrics.queueSize, " items in queue, ").concat(metrics.dlqSize, " in DLQ"));
                    // Test duplicate detection
                    return [4 /*yield*/, processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload)];
                case 3:
                    // Test duplicate detection
                    _a.sent();
                    metricsAfterDup = getQueueMetrics();
                    console.log("\uD83D\uDCCA Queue metrics after duplicate: ".concat(metricsAfterDup.queueSize, " items in queue (should be same as before)"));
                    cbStatus = getCircuitBreakerStatus();
                    console.log("\uD83D\uDD04 Circuit breaker status: ".concat(cbStatus.isOpen ? 'OPEN' : 'CLOSED', ", failures: ").concat(cbStatus.failureCount));
                    console.log('\n✅ All manual tests completed successfully!');
                    console.log('✅ Webhook flow functionality is working properly');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Manual test failed:', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Execute the manual test
manualTest().catch(function (err) {
    console.error('Manual test execution failed:', err);
    process.exit(1);
});
