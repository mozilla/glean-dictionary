import tippy from "tippy.js";

export default (node, props) => {
  let instance = props && tippy(node, props);
  return {
    update(newProps) {
      if (instance) instance.destroy();
      if (newProps) instance = tippy(node, newProps);
    },
    destroy() {
      if (instance) instance.destroy();
    },
  };
};
