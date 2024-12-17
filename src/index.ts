import { parse } from "yaml";
import { join } from "path";
import { readFileSync } from "fs";

import type { Module } from "@rspack/core";

const yaml = readFileSync(join(process.cwd(), "pnpm-lock.yaml")).toString();
const json = parse(yaml);

const packages = Object.keys(json.snapshots);
const collected = new Set<string>();

/**
 * Create a test function such that it returns true if and only if
 * the module matches any of the given {@link RegExp}s.
 */
export function makeTest(...tests: RegExp[]) {
	return (m: unknown) => {
		const mod = m as Module;
		const name = mod.nameForCondition() || mod.identifier();
		for(const test of tests) {
			if(test.test(name)) return true;
		}
		return false;
	};
}

/**
 * Based on the dependencies recorded in `pnpm-lock.yaml` file,
 * create a {@link RegExp} that covers all descendant packages of the given packages.
 * 
 * Note that this function has a side-effect: it will not include
 * packages that were collected during previous calls of this function.
 */
export function createDescendantRegExp(...names: string[]) {
	names = names.map(n => resolve(n));
	const list: string[] = [];
	names.forEach(n => listDescendantsRecursive(n, list));
	const descendants = list.map(k => k.match(/^@?[^@]+/)![0]);
	const pattern = "node_modules[\\\\/](" + descendants.map(k => k.replace("/", "[\\\\/]")).join("|") + ")";
	return new RegExp(pattern);
}

function resolve(n: string): string {
	const matches = packages.filter(k => k.startsWith(n + "@"));
	if(matches.length == 0) throw new Error("Package not found: " + n);
	if(matches.length > 1) throw new Error("Package ambiguous: " + matches.join(", "));
	return matches[0];
}

function listDescendantsRecursive(n: string, list: string[]) {
	if(collected.has(n)) return;
	collected.add(n);
	list.push(n);
	const { dependencies } = json.snapshots[n];
	if(!dependencies) return;
	const children = Object.keys(dependencies).map(k => k + "@" + dependencies[k]);
	for(const child of children) {
		listDescendantsRecursive(child, list);
	}
}
