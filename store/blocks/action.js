export const blockActionTypes = {
    NEWBLOCK: 'NEWBLOCK',
    RECENTBLOCKS: 'RECENTBLOCKS',
}
  
export const addNewBlock = (block) => (dispatch) => {
    return dispatch({
        type: blockActionTypes.NEWBLOCK,
        data: block
    })
}

export const setRecentBlocks = (blocks) => (dispatch) => {
    return dispatch({
        type: blockActionTypes.RECENTBLOCKS,
        data: blocks
    })
}