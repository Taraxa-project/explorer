export const txActionTypes = {
    RECENTTXS: 'RECENTTXS',
}

export const setRecentTxs = (txs) => (dispatch) => {
    return dispatch({
        type: txActionTypes.RECENTTXS,
        data: txs
    })
}