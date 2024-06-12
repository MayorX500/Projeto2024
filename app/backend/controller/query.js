class QueryBuilder {
    constructor() {
        this.query = {
            select: [],
            from: '',
            where: [],
            orderBy: []
        };
    }

    select(fields) {
        if (Array.isArray(fields)) {
            this.query.select.push(...fields);
        } else {
            this.query.select.push(fields);
        }
        return this;
    }

    from(table) {
        this.query.from = table;
        return this;
    }

    where(condition) {
        this.query.where.push(condition);
        return this;
    }

    orderBy(field, direction = 'ASC') {
        this.query.orderBy.push(`${field} ${direction}`);
        return this;
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

        return `SELECT ${selectClause} ${fromClause} ${whereClause} ${orderByClause}`.trim();
    }

    toString() {
        return this.build();
    }
}

module.exports = QueryBuilder;