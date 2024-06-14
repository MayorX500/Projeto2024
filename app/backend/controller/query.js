const blacklistedWords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE',
    'UNION', 'OR', 'AND', '--', ';', '/*', '*/', 'xp_', 'exec', 'sp_'
];

function validateAgainstBlacklist(input) {
    const upperInput = input.toUpperCase();
    for (const word of blacklistedWords) {
        if (upperInput.includes(word)) {
            return false;
        }
    }
    return true;
}

class QueryBuilder {
    constructor() {
        this.entries_per_page = 10;
        this.paginate = false;
        this.query = {
            select: [],
            from: '',
            where: [],
            orderBy: [],
            page: 1
        };
    }

    select(fields) {
        if (Array.isArray(fields)) {
            for (const field of fields) {
                if (!validateAgainstBlacklist(field)) {
                    return this;
                }
            }
            this.query.select.push(...fields);
        } else {
            this.query.select.push(fields);
        }
        return this;
    }

    from(table) {
        if (validateAgainstBlacklist(table)) {
            this.query.from = table;
            return this;
        }
    }

    where(condition) {
        if (validateAgainstBlacklist(condition)) {
            this.query.where.push(condition);
            return this;
        }
    }

    orderBy(field, direction = 'ASC') {
        if (validateAgainstBlacklist(field) && validateAgainstBlacklist(direction)){
            this.query.orderBy.push(`${field} ${direction}`);
            return this;
        }
    }

    page(page) {
        if (validateAgainstBlacklist(page)) {
            this.paginate = true;
            this.query.page = page;
            return this;
        }
    }

    build() {
        let fromClause = '';
        if (!this.query.from) {
            fromClause = 'FROM dreapp_document';
            
        }else {
            fromClause = `FROM ${this.query.from}`;
        }

        const selectClause = this.query.select.length > 0 ? this.query.select.join(', ') : '*';
        const whereClause = this.query.where.length > 0 ? `WHERE ${this.query.where.join(' AND ')}` : '';
        const orderByClause = this.query.orderBy.length > 0 ? `ORDER BY ${this.query.orderBy.join(', ')}` : '';
        const limitClause = `LIMIT ${this.entries_per_page} OFFSET ${(this.query.page - 1) * this.entries_per_page}`;

        return `SELECT ${selectClause} ${fromClause} ${whereClause} ${orderByClause} ${this.paginate ? limitClause: ''}`.trim();
    }

    toString() {
        return this.build();
    }
}

module.exports = QueryBuilder;