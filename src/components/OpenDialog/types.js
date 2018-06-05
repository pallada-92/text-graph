import { arrayOf, shape, oneOf, oneOfType, string } from 'prop-types';

export const PartType = shape({
  url: string.isRequired,
  title: string.isRequired,
});

export const ItemType = shape({
  type: oneOf(['item']).isRequired,
  title: string.isRequired,
  parts: arrayOf(PartType).isRequired,
});

// we do not want to bother with recursive types and lazy functions
export const FolderType = shape({
  type: oneOf(['folder']).isRequired,
  title: string.isRequired,
  children: arrayOf(shape({})),
});

export const IndexType = arrayOf(oneOfType([ItemType, FolderType]));
