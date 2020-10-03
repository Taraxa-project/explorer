export const dagBlockActionTypes = {
    NEWDAGBLOCK: 'NEWDAGBLOCK',
    FINALIZEDDAGBLOCK: 'FINALIZEDDAGBLOCK'
}
  
export const addNewDagBlock = (block) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.NEWDAGBLOCK,
        data: block
    })
}

export const finalizeDagBlock = (block) => (dispatch) => {
    return dispatch({
        type: dagBlockActionTypes.FINALIZEDDAGBLOCK,
        data: block
    })
}