async function walk(ast, walker) {
	const instance = new WalkerClass(walker);
	return await instance.visit(ast, null, walker.enter, walker.leave);
}

class WalkerClass {
	
	
	 __init() {this.should_skip = false;}
	 __init2() {this.should_remove = false;}
	 __init3() {this.replacement = null;}

	constructor(walker) {WalkerClass.prototype.__init.call(this);WalkerClass.prototype.__init2.call(this);WalkerClass.prototype.__init3.call(this);WalkerClass.prototype.__init4.call(this);
		this.enter = walker.enter;
		this.leave = walker.leave;
	}
 
	 __init4() {this.context = {
		skip: () => this.should_skip = true,
		remove: () => this.should_remove = true,
		replace: (node) => this.replacement = node
	};}

	 replace(parent, prop, index, node) {
		if (parent) {
			if (index !== null) {
				parent[prop][index] = node;
			} else {
				parent[prop] = node;
			}
		}
	}

	 remove(parent, prop, index) {
		if (parent) {
			if (index !== null) {
				parent[prop].splice(index, 1);
			} else {
				delete parent[prop];
			}
		}
	}

	 async visit(
		node,
		parent,
		enter,
		leave,
		prop,
		index
	) {
		if (node) {
			if (enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				await enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			for (const key in node) {
				const value = (node )[key];

				if (typeof value !== 'object') {
					continue;
				}

				else if (Array.isArray(value)) {
					for (let j = 0, k = 0; j < value.length; j += 1, k += 1) {
						if (value[j] !== null && typeof value[j].type === 'string') {
							if (!await this.visit(value[j], node, enter, leave, key, k)) {
								// removed
								j--;
							}
						}
					}
				}

				else if (value !== null && typeof value.type === 'string') {
					await this.visit(value, node, enter, leave, key, null);
				}
			}

			if (leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				await leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}

export { walk };
