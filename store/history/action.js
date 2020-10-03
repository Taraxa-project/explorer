export const historyActionTypes = {
    ADDHISTORY: 'ADDHISTORY'
}

export const addNewHistory = (message) => (dispatch) => {
    return dispatch({
        type: historyActionTypes.ADDHISTORY,
        data: message
    })
}