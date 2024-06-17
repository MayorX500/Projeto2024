![Logo](app/frontend/public/images/DR.png)
# Diário da República: Gestor de publicações


Trabalho Prático da Unidade Curricular de Engenharia Web


## Intro

Este relatório descreve o desenvolvimento de um gestor de publicações  para o Diário da República Portuguesa. O projeto envolveu a criação de uma aplicação completa com autenticação, exportação/importação do estado da aplicação, upload/download de ficheiros e operações CRUD.



## Autores

- [Filipa de Sousa Gomes](https://github.com/FilipaSGomes) (A96556)

- [Pedro Miguel Rodrigues Gomes](https://github.com/MayorX500) (A93294)


## Funcionalidades Implementadas

- **Operações CRUD:** Gestão dos documentos e ficheiros dos acórdãos;

- **Autenticação:** Implementação de LogIn e LogOut recorrendo a JWT;

- **Upload/Download de Ficheiros:** Ação de upload/download de ficheiros associados a acórdãos;

- **Área Pessoal:** Gestão de registos a guardar na área pessoal do utilizador autenticado;

- **Filtragem:** Implementação de diversas táticas de filtagrem dinâmica;



## Base de Dados

Devido ao tamanho considerável do dataset fornecido pelo docente da UC, foi crucial a utilização de PostgreSQL para o armazenamento de dados.

A base de dados foi hospedada num servidor dedicado, com acesso ao exterior, de modo a garantir uma fácil conexão pelos membros do grupo de trabalho, ou até mesmo a pessoas de fora que queiram aceder e explorar este projeto.



### Exploração dos datasets

Tendo em conta que o dataset fornecido possui 9GB de informação, realizou-se uma análise ao conjunto de dados/campos de dados utilizados no site oficial do [Diário da República](https://diariodarepublica.pt/dr/home), com o objetivo de eliminar informação que não viria a ser utilizada.

Contudo, devido à extensão do dataset, não foi possível realizar uma limpeza do mesmo.


```sql
-- Schema for table dreapp_document
CREATE TABLE public.dreapp_document (
    id BIGINT PRIMARY KEY,
    some_id BIGINT,
    type TEXT,
    code TEXT,
    ministry TEXT,
    publication TEXT,
    identifier TEXT,
    active BOOLEAN,
    revoked BOOLEAN,
    publication_date DATE,
    description TEXT,
    pdf_link TEXT,
    additional_link TEXT,
    is_confidential BOOLEAN,
    created_at TIMESTAMPTZ,
    is_deleted BOOLEAN,
    reference TEXT,
    version INT,
    status TEXT
);

-- Schema for table dreapp_documenttext
CREATE TABLE public.dreapp_documenttext (
    id BIGINT PRIMARY KEY,
    reference_id BIGINT, -- REFERENCES dreapp_document(id),
    created_at TIMESTAMPTZ,
    url TEXT,
    content TEXT
);
```
### Autenticação

Para a autenticação dos utilizadores, foram utilizados JWT (JSON Web Tokens). Implementou-se um middleware de modo a proteger certas rotas com base no tipo de utilizador que faz o acesso, garantindo assim a segurança necessária para a aplicação.

Existe uma base de dados com todos os utilizadores e os seus respetivos dados.

```sql
-- databases/postgres/initdb.d/01-init.sql
-- Schema for table dreapp_user
CREATE TABLE public.dreapp_user (
    id BIGINT PRIMARY KEY, -- Social security number (xxx xxx xxx)
    password TEXT,
    email TEXT,
    full_name TEXT,
    isAdmin BOOLEAN,
    isEditor BOOLEAN,
    posts_created BIGINT,
    favourites BIGINT[],
    token TEXT,
    created_at TIMESTAMPTZ,
    is_deleted BOOLEAN
);
```

#### Níveis de acesso

Visando explorar os possíveis tipos de clientes, existem quatro níveis de acesso na aplicação:

- **Administrador:** possui todas as permissões;
- **Editor:** possui todas as permissões em excessão da exportação/importação do estado da aplicação;
- **Utilizador (com login):** possui acesso a áreas privadas, tais como os seus favoritos, e a todos os documentos;
- **Visitante:** apenas tem permissão para aceder aos documentos sem puder realizar qualquer tipo de ação perante o estado da aplicação.


## Serviços

A divisão da aplicação em três serviços distintos facilitou bastante a sua organização e manutenção.
- **Authenticator (Port: 3004):** Responsável pelo processo de autenticação dos utilizadores.
- **Frontend (Port: 3002):** Serve as páginas ao cliente.
- **Backend (Port: 3000):** Gere a troca de dados entre a aplicação e a API.

### Rotas Definidas

#### Authenticator
- **Página Inicial:**   (`http://localhost:3002/`) - adição de filtros na interface
- **LogIn:**   (`http://localhost:3002/login`)
- **LogOut:**   (`http://localhost:3002/logout`)
- **Registrar Novo Utilizador:**   (`http://localhost:3002/register`)
- **Aceder Documento:**   (`http://localhost:3002/specific/:id`)
- **Todos os Documentos com a Publicação "AA":**   (`http://localhost:3002/publication?pub=AA`)
- **Todos os Documento com o Emissor "AA":**   (`http://localhost:3002/ministry?min=AA`)
- **Erro de Permissões:**   (`http://localhost:3002/auth_error/:code`)
- **Área Pessoal:**   (`http://localhost:3002/favorites`)
- **Criar Documento:**   (`http://localhost:3002/create`)
- **Editar Documento:**   (`http://localhost:3002/edit/:id`)
- **Export:**   (`http://localhost:3002/export`)
- **Import:**   (`http://localhost:3002/import`)

É importante reafirmar que algumas das rotas dependem da autenticação e das permissões de cada utilizador, como é o caso das `Área Pessoal`, `Criar Documento` e `Editar Documento`.

### Consultas e Operações na BD

Através de queries SQL, foi possível aceder aos dados necessários.
Desenvolveu-se uma função personalizada para a criação de queries dinâmicas, proporcionando maior flexibilidade na interação entre os vários serviços.

```javascript
//../backend/controller/decreto.js
// Get with custom query
async function getCustom (query) {
    let isValidStart = allowList.some(word => query.startsWith(word));

    if (!isValidStart) {
        return null;
    }
    let result = await Client.query ( query );
    return result.rows ? result.rows : null;
}
```
```javascript
//../backend/routes/index.js
// Function to build a query with custom filters
function build_query_with_custom_filters(filters) {
  let query = new QueryBuilder();
  let sort = "";
  let order = "";
  for (let key in filters) {
    if (key == "fields") {
      query.select(filters[key]);
    }
    if (key == "publication_date") {
      query.where(`publication_date='${filters[key]}'`);
    }
    //(...)
  }
  if (sort != "" || order != "") {
    query.orderBy(sort, order);
}
  return query.build();
}
```

Foi tido em consideração a possibilidade de injeções exteriores na base de dados, vulgarmente conhecidas por *SQL Injections*, daí existir uma *blacklist* de palavras que serão ignoradas caso estejam contidas na query pedida, backend/controller/query.js.

## Conclusão

O projeto resultou numa aplicação robusta e segura para a gestão de acórdãos do Diário da República Portuguesa. A utilização de PostgreSQL para a base de dados e a implementação de servidores dedicados para autenticação, frontend e backend proporcionaram uma estrutura eficiente e de relativamente fácil manutenção. A flexibilidade na criação de queries permitiu uma interação dinâmica com os dados, atendendo às necessidades específicas do projeto.

## Melhorias

Com o desenvolver do projeto foi possível observar alguns pontos a melhorar:
- Oferecer mais métodos de filtagrem e procura como o emissor, que só não foi implementado na entrega final do projeto devido ao vasto números de Emissores existentes distintos (4700~4750)

- Melhorar o upload de ficheiros no sentido de quando um utilizador escolher editar um documento, este não perder o seu ficheiro correspondente ao campo "pdf_link"

- Implementar a exportação/importação do estado da aplicação não foi possível de implementar devido ao tamanho do dataset ser grande. Contudo, existe um *dump* com as alterações mais recentes no link [Dump.sql](http://mayorx.xyz/Media/EngWeb2024/project/dump.sql) (8.9Gb).