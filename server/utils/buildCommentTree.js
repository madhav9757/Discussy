const buildCommentTree = (comments) => {
  const map = new Map();
  const roots = [];

  comments.forEach((comment) => {
    comment.replies = [];
    map.set(comment._id.toString(), comment);
  });

  comments.forEach((comment) => {
    if (comment.parentId && typeof comment.parentId === 'object') {
      const parentIdStr = comment.parentId._id
        ? comment.parentId._id.toString()
        : comment.parentId.toString(); // fallback

      const parent = map.get(parentIdStr);
      if (parent) {
        parent.replies.push(comment);
      } else {
        roots.push(comment); // fallback if parent not found
      }
    } else {
      roots.push(comment);
    }
  });

  return roots;
};

export default buildCommentTree;
