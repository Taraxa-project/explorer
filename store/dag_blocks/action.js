export const dagBlockActionTypes = {
    NEWDAGBLOCK: 'NEWDAGBLOCK',
    RECENTDAGBLOCKS: 'RECENTDAGBLOCKS',
    FINALIZEDDAGBLOCK: 'FINALIZEDDAGBLOCK'
}
  
export const addNewDagBlock = (block) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.NEWDAGBLOCK,
        data: block
    })
}

export const setRecentDagBlocks = (blocks) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.RECENTDAGBLOCKS,
        data: blocks
    })
}

export const finalizeDagBlock = (block) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.FINALIZEDDAGBLOCK,
        data: block
    })
}