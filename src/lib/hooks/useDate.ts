import moment from "moment";

// NOT AN ACTUAL HOOK
// a method of displaying the date relative to now
export const useDate = (
	dateObj: Date,
	withoutSuffix: boolean = false
): string => {
	let momentObj = moment(dateObj, "YYYYMMDDHHmmss").fromNow(withoutSuffix);
    return momentObj;
};
