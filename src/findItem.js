const findItem = (index, id = window.location.hash.replace('#', '')) => {
  let result = null;
  if (!id) return null;
  index.forEach(elem => {
    if (elem.type === 'item') {
      if (elem.id === id) {
        result = elem;
      }
    } else {
      const recRes = findItem(elem.children, id);
      if (recRes !== null) {
        result = recRes;
      }
    }
  });
  return result;
};

export default findItem;
