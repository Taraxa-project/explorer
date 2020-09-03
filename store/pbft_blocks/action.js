export const blockActionTypes = {
    NEWPBFTBLOCK: 'NEWPBFTBLOCK',
    RECENTPBFTBLOCKS: 'RECENTPBFTBLOCKS',
}
  
export const addNewPbftBlock = (block) => (dispatch) => {
    return dispatch({
        type: blockActionTypes.NEWPBFTBLOCK,
        data: block
    })
}

export const setRecentPbftBlocks = (blocks) => (dispatch) => {
    return dispatch({
        type: blockActionTypes.RECENTPBFTBLOCKS,
        data: blocks
    })
}