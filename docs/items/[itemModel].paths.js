import modelInfo from "../public/item/modelInfo.json";

export default {
  paths() {
    let path = [];
    for (let model in modelInfo) {
      path.push({
        params: { itemModel: modelInfo[model], name: modelInfo[model] },
      });
    }
    return path;
  },
};
