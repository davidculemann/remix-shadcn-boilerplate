import iso_639_1, { type LanguageCode } from "iso-639-1";
import * as semver from "semver";

const CODES = iso_639_1.getAllCodes();

export function validateParams(
	tags: string[],
	branches: string[],
	params: { lang: string; ref?: string; "*"?: string },
	lang = "en",
): string | null {
	const { lang: first, ref: second, "*": splat } = params;

	const firstIsLang = CODES.includes(first as LanguageCode);
	const secondIsRef = second && (tags.includes(second) || branches.includes(second));

	if (firstIsLang) {
		if (!second) {
			return `${first}/${semver.maxSatisfying(tags, "*", {
				includePrerelease: false,
			})}`;
		}

		if (!secondIsRef) {
			const expandedRef = semver.maxSatisfying(tags, second, {
				includePrerelease: false,
			});
			const latest = semver.maxSatisfying(tags, "*");
			const path = [first];

			if (expandedRef) {
				path.push(expandedRef);
			} else if (latest) {
				if (semver.valid(second)) {
					// If second looks like a semver tag but we didn't find it as a ref in
					// the repo, we might just have a stale set of branches/tags from github.
					// Instead of pushing both in and generating a 404 (/en/1.16.0/1.17.0/pages/...)
					// we just point them back to the requested doc on main
					path.push("main");
				} else {
					path.push(latest, second);
				}
			}

			if (splat) path.push(splat);
			return path.join("/");
		}
	}

	const ref =
		tags.includes(first) || branches.includes(first)
			? first
			: semver.maxSatisfying(tags, first, { includePrerelease: false });
	if (ref) {
		const path = [lang, ref];
		if (second) path.push(second);
		if (splat) path.push(splat);
		return path.join("/");
	}

	// If we don't have a language and we can't detect a ref, fallback to `main`
	// so we get the latest and we can be comfortable redirecting on 404 slugs.
	// If we were to redirect to the latest semver here (i.e., 2.1.0), then we
	// can't safely process a slug 404 redirect in docs/$lang.$ref/$.tsx since we
	// don't know that they weren't looking for something in a specific version
	if (!firstIsLang && !ref) {
		const path = [lang, "main", first];
		if (second) path.push(second);
		if (splat) path.push(splat);
		return path.join("/");
	}

	return null;
}
