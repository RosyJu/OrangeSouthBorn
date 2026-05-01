export const value = {
  points_a: [],
  points_b: [],
};

export function set(points_a, points_b) {
  if (!points_a || !points_b) {
    return "❌ 坐标不能为空";
  }
  if (points_a.length != points_b.length) {
    return "❌ 两个点的坐标数量不一致";
  }
  if (points_a.length != 3) {
    return "❌ 角点1坐标数量错误 : 必须为3";
  }
  if (points_b.length != 3) {
    return "❌ 角点2坐标数量错误 : 必须为3";
  }
  for (let point of points_a) {
    point = Number(point);
    if (typeof point != "number") {
      return "❌ 角点1坐标错误 : 必须为数字";
    }
  }
  for (let point of points_b) {
    point = Number(point);
    if (typeof point != "number") {
      return "❌ 角点2坐标错误 : 必须为数字";
    }
  }
  value.points_a = points_a;
  value.points_b = points_b;
  return "✅ 区域选择成功";
}
