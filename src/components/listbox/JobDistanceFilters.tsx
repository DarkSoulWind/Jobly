import React, {
	Fragment,
	DetailedHTMLProps,
	HTMLAttributes,
	FC,
	SetStateAction,
} from "react";
import router from "next/router";
import { Listbox, Transition } from "@headlessui/react";
import { HiChevronDown, HiCheckCircle } from "react-icons/hi";
import { JobSearchState } from "src/lib/reducers/jobReducer";
import { useQueryClient } from "react-query";

interface JobDistanceFiltersProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	distance: string;
	setDistance: (value: SetStateAction<string>) => void;
	distanceTypes: number[];
	jobSearchState: JobSearchState;
}

const JobDistanceFilters: FC<JobDistanceFiltersProps> = ({
	distance,
	setDistance,
	distanceTypes,
	jobSearchState,
}) => {
	const queryClient = useQueryClient();

	return (
		<Listbox
			value={distance}
			onChange={(e) => {
				router.push(
					{
						pathname: `/jobs/search/${jobSearchState.searchInput}`,
						query: {
							location: jobSearchState.locationInput,
							distance: e,
						},
					},
					undefined,
					{ shallow: true }
				);
				setDistance(e);
				queryClient.invalidateQueries("job-preview");
			}}
		>
			<div className="py-5 relative">
				<Listbox.Label className="font-bold">Distance</Listbox.Label>
				<Listbox.Button className="relative w-full cursor-pointer transition-all rounded-lg bg-white hover:bg-slate-50 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
					<span className="block truncate">Within {distance}km</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<HiChevronDown
							className="h-5 w-5 text-gray-400"
							aria-hidden="true"
						/>
					</span>
				</Listbox.Button>
				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
						{distanceTypes.map((value, index) => (
							<Listbox.Option
								key={index}
								className={({ active }) =>
									`relative cursor-pointer select-none py-2 pl-10 pr-4 transition-all duration-300 ${
										active
											? "bg-amber-100 text-amber-900"
											: "text-gray-900"
									}`
								}
								value={value}
							>
								{({ selected }) => (
									<>
										<span
											className={`block truncate ${
												selected
													? "font-medium"
													: "font-normal"
											}`}
										>
											{value}
										</span>
										{selected ? (
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
												<HiCheckCircle
													className="h-5 w-5"
													aria-hidden="true"
												/>
											</span>
										) : null}
									</>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	);
};

export default JobDistanceFilters;
