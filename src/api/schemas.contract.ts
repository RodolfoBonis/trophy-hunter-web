/**
 * Checagem de contrato em tempo de compilação: todo campo que o openapi.yaml declara precisa existir
 * no schema zod correspondente. Se a API renomear/adicionar um campo e `pnpm gen:api` for rodado, o
 * `tsc` falha aqui apontando o schema a atualizar. (Não roda nada — só tipos.)
 */
import type { components } from "./generated/schema";
import type {
  ConnectSteamRequest,
  EnqueueResponse,
  Game,
  GameAccount,
  GameDetail,
  GameListItem,
  GameListPage,
  Integration,
  ProgressBucket,
  ProgressDetail,
  ProgressSummary,
  SyncRun,
  Trophy,
  TrophyGroup,
  TypeCount,
  User,
} from "./schemas";

type Gen = components["schemas"];

/** Chaves do contrato que faltam no nosso tipo (deve ser `never`). */
type MissingKeys<Contract, Ours> = Exclude<keyof Contract, keyof Ours>;
type AssertNever<T extends never> = T;

export type ContractChecks = [
  AssertNever<MissingKeys<Gen["User"], User>>,
  AssertNever<MissingKeys<Gen["Integration"], Integration>>,
  AssertNever<MissingKeys<Gen["ConnectSteamRequest"], ConnectSteamRequest>>,
  AssertNever<MissingKeys<Gen["EnqueueResponse"], EnqueueResponse>>,
  AssertNever<MissingKeys<Gen["SyncRun"], SyncRun>>,
  AssertNever<MissingKeys<Gen["ProgressSummary"], ProgressSummary>>,
  AssertNever<MissingKeys<Gen["ProgressDetail"], ProgressDetail>>,
  AssertNever<MissingKeys<Gen["ProgressBucket"], ProgressBucket>>,
  AssertNever<MissingKeys<Gen["TypeCount"], TypeCount>>,
  AssertNever<MissingKeys<Gen["Game"], Game>>,
  AssertNever<MissingKeys<Gen["GameAccount"], GameAccount>>,
  AssertNever<MissingKeys<Gen["GameListItem"], GameListItem>>,
  AssertNever<MissingKeys<Gen["GameListPage"], GameListPage>>,
  AssertNever<MissingKeys<Gen["GameDetail"], GameDetail>>,
  AssertNever<MissingKeys<Gen["TrophyGroup"], TrophyGroup>>,
  AssertNever<MissingKeys<Gen["Trophy"], Trophy>>,
];
