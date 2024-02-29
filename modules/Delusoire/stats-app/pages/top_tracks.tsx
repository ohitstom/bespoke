import { S } from "/modules/Delusoire/std/index.js";
const { React } = S;

import PageContainer from "../components/shared/page_container.js";
import useDropdown from "../components/shared/dropdown/useDropdownMenu.js";
import { DEFAULT_TRACK_IMG } from "../static.js";
import RefreshButton from "../components/shared/buttons/refresh_button.js";
import SettingsButton from "../components/shared/settings_button.js";
import { spotifyApi } from "../../delulib/api.js";
import type { Track } from "@fostertheweb/spotify-web-api-ts-sdk";
import { SpotifyTimeRange } from "../api/spotify.js";

const DropdownOptions = ["Past Month", "Past 6 Months", "All Time"] as const;
const OptionToTimeRange = {
	"Past Month": SpotifyTimeRange.Short,
	"Past 6 Months": SpotifyTimeRange.Medium,
	"All Time": SpotifyTimeRange.Long,
} as const;

const columns = ["INDEX", "TITLE_AND_ARTIST", "ALBUM", "DURATION"];
const allowedDropTypes = [];

export const fetchTopTracks = (timeRange: SpotifyTimeRange) => spotifyApi.currentUser.topItems("tracks", timeRange, 50, 0);

const TracksPage = () => {
	const [dropdown, activeOption] = useDropdown(DropdownOptions, "top-tracks");
	const timeRange = OptionToTimeRange[activeOption];

	const { isLoading, error, data, refetch } = S.ReactQuery.useQuery({
		queryKey: ["topTracks", timeRange],
		queryFn: () => fetchTopTracks(timeRange),
	});

	const thisRef = React.useRef(null);

	const { usePlayContextItem } = S.getPlayContext({ uri: "" }, { featureIdentifier: "queue" });

	if (isLoading) {
		return "Loading";
	}

	if (error) {
		return "Error";
	}

	const topTracks = data.items;

	const pageContainerProps = {
		title: "Top Tracks",
		headerEls: [dropdown, <RefreshButton callback={refetch} />, <SettingsButton section="stats" />],
		infoToCreatePlaylist: {
			playlistName: `Top Songs - ${activeOption}`,
			itemsUris: topTracks.map(track => track.uri),
		},
	};

	return (
		<PageContainer {...pageContainerProps}>
			<S.ReactComponents.TracklistColumnsContextProvider columns={columns}>
				<S.ReactComponents.Tracklist
					ariaLabel="Top Tracks"
					hasHeaderRow={true}
					columns={columns}
					renderRow={(track: Track, index: number) => (
						<S.ReactComponents.TracklistRow
							index={index}
							uri={track.uri}
							name={track.name}
							artists={track.artists}
							imgUrl={track.album.images.at(-1)?.url ?? DEFAULT_TRACK_IMG}
							isExplicit={track.explicit}
							albumOrShow={track.album}
							duration_ms={track.duration_ms}
							usePlayContextItem={usePlayContextItem}
							allowedDropTypes={allowedDropTypes}
						/>
					)}
					resolveItem={track => ({ uri: track.uri })}
					nrTracks={topTracks.length}
					fetchTracks={(offset, limit) => topTracks.slice(offset, offset + limit)}
					limit={50}
					outerRef={thisRef}
					tracks={topTracks}
					isCompactMode={false}
					columnPersistenceKey="stats-top-tracks"
				>
					spotify:app:stats:tracks
				</S.ReactComponents.Tracklist>
			</S.ReactComponents.TracklistColumnsContextProvider>
		</PageContainer>
	);
};

export default React.memo(TracksPage);