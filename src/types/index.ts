export interface ColorPalette {
  id: string;             // 唯一标识符 (例如使用 uuid，或者时间戳)
  imageUrl: string;       // 原图的 Base64 编码或本地 Blob URL

  // 对应图中的排版元素
  title: string;          // 主标题：如原图中的 "EMPTY"，用户可修改
  serialNumber: string;   // 编号：如原图右上角的 "No.20250515"，可自动生成当前日期
  author: string;         // 作者/来源：如原图顶部的 "@HUNTER"

  // 核心色彩数据
  colors: string[];       // 提取出的 5 个 HEX 色值数组，如 ['#11284D', '#264B6F', '#101A2C', '#F4EFDF', '#D5B370']

  // 进阶管理（预留）
  tags?: string[];        // 标签：如 ['插画', '国风', '深邃']
  createdAt: number;      // 创建时间戳，用于排序
}
