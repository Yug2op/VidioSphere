import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    try {
        return res
        .json(
            new ApiResponse(
                200,
                {status:"OK"},
                "Server is running smoothly."
            )
        )
    } catch (error) {
        throw new ApiError(
            500,
            "Heatlthcheck failed. Somthing went wrong."
        )
    }
})

export {
    healthcheck
    }