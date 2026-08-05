import { createContext, useReducer } from "react";
import { ContactInfo } from "./Data";

export const Store = createContext({ state: {}, dispatch: () => {} });

const initialState = {
    UserInfo: localStorage.getItem("UserInfo")
        ? JSON.parse(localStorage.getItem("UserInfo"))
        : null,

    Admin: localStorage.getItem("Admin")
        ? JSON.parse(localStorage.getItem("Admin"))
        : null,

    ContactInfo: localStorage.getItem("ContactInfo")
        ? JSON.parse(localStorage.getItem("ContactInfo"))
        : ContactInfo,

    Cart: localStorage.getItem("CartItem")
        ? JSON.parse(localStorage.getItem("CartItem"))
        : [],

    Currency: localStorage.getItem("CurrencyCode") || "PKR",
};

const rates = { PKR: 1, USD: 0.0036, EUR: 0.0033 };
const symbols = { PKR: 'Rs', USD: '$', EUR: '€' };

function reducer(state, action) {
    switch (action.type) {
        case "ClearUserInfo":
            return { ...state, UserInfo: null };
        case "Admin":
            return { ...state, Admin: action.payload };
        case "UserLoggedIn":
            localStorage.setItem("UserInfo", JSON.stringify(action.payload));  // Save to localStorage
            return { ...state, UserInfo: action.payload };
        case "UserLoggedOut":
            localStorage.removeItem("UserInfo");
            localStorage.removeItem("userToken");
            localStorage.removeItem("userToken");
            return { ...state, UserInfo: null };

        case "ChangeCurrency":
            localStorage.setItem("CurrencyCode", action.payload);
            return { ...state, Currency: action.payload };


        case "add-to-cart": {
            const item = action.payload;
            const existItem = state.Cart.find((x) => x.id === item.id);
            const newCart = existItem
                ? state.Cart.map((x) =>
                    x.id === existItem.id
                        ? {
                            ...x,
                            quantity: x.quantity + 1, // Increase quantity
                            total: parseFloat(x.total) + parseFloat(item.price),
                        }
                        : x
                )
                : [...state.Cart, { ...item, quantity: 1, total: item.price }];

            localStorage.setItem("CartItem", JSON.stringify(newCart));

            // Check if the user has added 4 items
            const totalItems = newCart.reduce((acc, product) => acc + product.quantity, 0);
            const showPopup = totalItems === 4; // Show the popup when 4 items are added

            return { ...state, Cart: newCart, showPopup };
        }


        case "update-cart-quantity": {
            const { id, quantity } = action.payload;

            const newCart = state.Cart.map(item =>
                item.id === id ? { ...item, quantity, total: parseFloat(item.price) * quantity } : item
            );

            localStorage.setItem("CartItem", JSON.stringify(newCart));
            return { ...state, Cart: newCart };
        }

        case "remove-from-cart":
            const updatedCart = state.Cart.filter((item) => item.id !== action.payload.id);
            localStorage.setItem("CartItem", JSON.stringify(updatedCart));
            return { ...state, Cart: updatedCart };

        case "clear-cart":
            localStorage.removeItem("CartItem");  // Clear cart from localStorage
            return { ...state, Cart: [] };

        case "load-cart":
            localStorage.setItem("CartItem", JSON.stringify(action.payload));
            return { ...state, Cart: action.payload };

        default:
            return state;
    }
}

export function StoreProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const convertPrice = (price) => {
        const currency = state.Currency || 'PKR';
        const rate = rates[currency] || 1;
        const converted = price * rate;
        return currency === 'PKR'
            ? `Rs ${Math.round(converted)}`
            : `${symbols[currency]} ${converted.toFixed(2)}`;
    };

    const value = { state, dispatch, convertPrice };
    return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
