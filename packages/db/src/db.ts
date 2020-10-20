import { GraphQLSchema, DocumentNode, parse, execute } from "graphql";
import { Loaders } from "./loaders";
import { schema } from "./schema";
import { connect } from "./connect";
import { Databases } from "./definitions";

interface IConfig {
  contracts_build_directory: string;
  contracts_directory: string;
  working_directory?: string;
  db?: {
    adapter?: {
      name: string;
      settings?: any;
    };
  };
}

interface IContext {
  artifactsDirectory: string;
  workingDirectory: string;
  contractsDirectory: string;
  workspace: Databases;
  db: ITruffleDB;
}

interface ITruffleDB {
  query: (query: DocumentNode | string, variables: any) => Promise<any>;
}

export class TruffleDB {
  public schema: GraphQLSchema;
  public loaders: Loaders;

  private context: IContext;

  constructor(config: IConfig) {
    this.context = this.createContext(config);
    this.schema = schema;
    this.loaders = new Loaders({
      db: this
    });
  }

  async query(query: DocumentNode | string, variables: any = {}): Promise<any> {
    const document: DocumentNode =
      typeof query !== "string" ? query : parse(query);

    return await execute(this.schema, document, null, this.context, variables);
  }

  createContext(config: IConfig): IContext {
    return {
      workspace: connect({
        workingDirectory: config.working_directory,
        adapter: (config.db || {}).adapter
      }),
      artifactsDirectory: config.contracts_build_directory,
      workingDirectory: config.working_directory || process.cwd(),
      contractsDirectory: config.contracts_directory,
      db: this
    };
  }
}
