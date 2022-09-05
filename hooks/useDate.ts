import moment from "moment";

// NOT AN ACTUAL HOOK
// a method of displaying the date relative to now
export const useDate = (
	dateObj: Date,
	withoutSuffix: boolean = false
): string => {
	let momentObj = moment(dateObj).subtract(1, "M");
	const momentString = momentObj.format("YYYY-MM-DD-HH-mm-ss");
	const a = moment(momentString.split("-")).fromNow(withoutSuffix);
	return a;
};
