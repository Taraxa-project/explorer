export const dagBlockActionTypes = {
    NEWBLOCK: 'NEWBLOCK',
    RECENTBLOCKS: 'RECENTBLOCKS',
    FINALIZEDBLOCK: 'FINALIZEDBLOCK'
}
  
export const addNewDagBlock = (block) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.NEWBLOCK,
        data: block
    })
}

export const setRecentDagBlocks = (blocks) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.RECENTBLOCKS,
        data: blocks
    })
}

export const finalizeDagBlock = (block) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.FINALIZEDBLOCK,
        data: block
    })
}