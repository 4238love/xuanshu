type RenYuanSegments = Record<string, ReadonlyArray<readonly [string, number]>>;

function expandSegments(segments: ReadonlyArray<readonly [string, number]>) {
  const values: string[] = [];

  segments.forEach(([gan, count]) => {
    for (let i = 0; i < count; i += 1) {
      values.push(gan);
    }
  });

  return values;
}

function buildRenYuanTable(segments: RenYuanSegments) {
  const table: Record<string, string[]> = {};

  Object.entries(segments).forEach(([zhi, value]) => {
    table[zhi] = expandSegments(value);
  });

  return table;
}

const BASE_REN_YUAN_SEGMENTS: RenYuanSegments = {
  寅: [['戊', 7], ['丙', 7], ['甲', 16]],
  卯: [['甲', 10], ['乙', 20]],
  辰: [['乙', 9], ['癸', 3], ['戊', 18]],
  巳: [['戊', 5], ['庚', 9], ['丙', 16]],
  午: [['丙', 10], ['己', 9], ['丁', 11]],
  未: [['丁', 9], ['乙', 3], ['己', 18]],
  申: [['己', 7], ['戊', 3], ['壬', 3], ['庚', 17]],
  酉: [['庚', 10], ['辛', 20]],
  戌: [['辛', 9], ['丁', 3], ['戊', 18]],
  亥: [['戊', 7], ['甲', 5], ['壬', 18]],
  子: [['壬', 10], ['癸', 20]],
  丑: [['癸', 9], ['辛', 3], ['己', 18]],
};

const XING_REN_YUAN_SEGMENTS: RenYuanSegments = {
  ...BASE_REN_YUAN_SEGMENTS,
  未: [['丁', 9], ['乙', 2], ['己', 19]],
};

const SAN_REN_YUAN_SEGMENTS: RenYuanSegments = {
  寅: [['己', 7], ['丙', 5], ['甲', 18]],
  卯: [['甲', 9], ['癸', 3], ['乙', 18]],
  辰: [['乙', 9], ['癸', 3], ['戊', 18]],
  巳: [['戊', 7], ['庚', 5], ['丙', 18]],
  午: [['丙', 9], ['乙', 3], ['丁', 18]],
  未: [['丁', 7], ['乙', 5], ['己', 18]],
  申: [['己', 7], ['戊', 3], ['壬', 3], ['庚', 17]],
  酉: [['庚', 7], ['丁', 3], ['辛', 20]],
  戌: [['辛', 7], ['丁', 5], ['戊', 18]],
  亥: [['戊', 7], ['甲', 5], ['壬', 18]],
  子: [['壬', 9], ['辛', 3], ['癸', 18]],
  丑: [['癸', 7], ['辛', 5], ['己', 18]],
};

const SHEN_REN_YUAN_SEGMENTS: RenYuanSegments = {
  ...BASE_REN_YUAN_SEGMENTS,
  午: [['丙', 10], ['己', 7], ['丁', 13]],
  申: [['戊', 7], ['壬', 7], ['庚', 16]],
};

const WAN_REN_YUAN_SEGMENTS: RenYuanSegments = {
  寅: [['己', 5], ['丙', 5], ['甲', 20]],
  卯: [['甲', 7], ['乙', 23]],
  辰: [['乙', 7], ['壬', 5], ['戊', 18]],
  巳: [['戊', 7], ['庚', 5], ['丙', 18]],
  午: [['丙', 7], ['丁', 23]],
  未: [['丁', 7], ['甲', 5], ['己', 18]],
  申: [['己', 5], ['壬', 5], ['庚', 20]],
  酉: [['庚', 7], ['辛', 23]],
  戌: [['辛', 7], ['丙', 5], ['戊', 18]],
  亥: [['戊', 5], ['甲', 5], ['壬', 20]],
  子: [['壬', 7], ['癸', 23]],
  丑: [['癸', 7], ['庚', 5], ['己', 18]],
};

export const REN_YUAN_TABLES = [
  buildRenYuanTable(BASE_REN_YUAN_SEGMENTS),
  buildRenYuanTable(BASE_REN_YUAN_SEGMENTS),
  buildRenYuanTable(XING_REN_YUAN_SEGMENTS),
  buildRenYuanTable(SAN_REN_YUAN_SEGMENTS),
  buildRenYuanTable(SHEN_REN_YUAN_SEGMENTS),
  buildRenYuanTable(WAN_REN_YUAN_SEGMENTS),
] as const;
