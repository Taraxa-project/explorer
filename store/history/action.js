export const historyActionTypes = {
    RECENTHISTORY: 'RECENTHISTORY',
    ADDHISTORY: 'ADDHISTORY'
}

export const addNewHistory = (message) => (dispatch) => {
    return dispatch({
        type: historyActionTypes.ADDHISTORY,
        data: message
    })
}

export const setRecentHistory = (history) => (dispatch) => {
    return dispatch({
        type: historyActionTypes.RECENTHISTORY,
        data: history
    })
}