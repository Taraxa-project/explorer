export const blockActionTypes = {
    NEWBLOCK: 'NEWBLOCK',
}
  
export const addNewBlock = (block) => (dispatch) => {
    return dispatch({
        type: blockActionTypes.NEWBLOCK,
        data: block
    })
}