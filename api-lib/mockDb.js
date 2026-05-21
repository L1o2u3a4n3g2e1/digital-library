export class MockPool {
  async execute() {
    return [[], {}];
  }

  async query() {
    return [[], {}];
  }

  async getConnection() {
    return this;
  }

  async release() {}

  async beginTransaction() {}

  async commit() {}

  async rollback() {}

  async end() {}
}

export default MockPool;
