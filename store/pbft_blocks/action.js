export const blockActionTypes = {
  NEWPBFTBLOCK: 'NEWPBFTBLOCK',
};

export const addNewPbftBlock = (block) => (dispatch) => {
  return dispatch({
    type: blockActionTypes.NEWPBFTBLOCK,
    data: block,
  });
};
