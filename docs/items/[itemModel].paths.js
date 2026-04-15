import modelInfo from "../public/item/modelInfo.json";

export default {
  paths() {
    let path = [];
    for (let model of modelInfo) {
      path.push({
        params: { itemModel: model },
      });
    }
    return path;
  },
};
