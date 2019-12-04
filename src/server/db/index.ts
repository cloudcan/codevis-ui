import neo4j from "neo4j-driver";
import { Parameters } from "neo4j-driver/types/v1/statement-runner";
import { Record } from "neo4j-driver/types/v1";

// global
let driver: neo4j.Driver;
let session: neo4j.Session;
/**
 * 打开数据库
 */
export function openDB() {
  driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "root"));
  session = driver.session();
  console.log("open neo4j database...");
}
/**
 * 执行cypher QL 查询
 * @param cql
 */
export async function execql(
  cql: string,
  params?: Parameters
): Promise<Record[]> {
  const result = await session.run(cql, params);
  return result.records;
}
/**
 * 关闭数据库
 */
export function closeDB() {
  session.close();
  driver.close();
}
