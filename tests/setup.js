/**
 * Jest Setup - Configuración inicial para tests
 * 
 * Este archivo se ejecuta antes de cada test suite.
 */

// Mock de localStorage
const localStorageMock = {
    store: {},
    getItem: function(key) {
        return this.store[key] || null;
    },
    setItem: function(key, value) {
        this.store[key] = value.toString();
    },
    removeItem: function(key) {
        delete this.store[key];
    },
    clear: function() {
        this.store = {};
    }
};

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

// Mock de alert y confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Limpiar mocks antes de cada test
beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});
