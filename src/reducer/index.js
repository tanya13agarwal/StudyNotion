import {combineReducers} from "@reduxjs/toolkit";

// import all reducers
import authReducer from "../slices/authSlice"
import profileReducer from "../slices/profileSlice";
import cartReducer from "../slices/cartSlice";
import courseReducer from "../slices/courseSlice";

// combines all reducers(slices)
const rootReducer  = combineReducers({
    auth: authReducer,
    profile:profileReducer,
    cart:cartReducer,
    course: courseReducer,
})
 
export default rootReducer 