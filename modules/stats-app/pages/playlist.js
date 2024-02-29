import { S } from "/modules/std/index.js";
const { React } = S;
import StatCard from "../components/cards/stat_card.js";
import GenresCard from "../components/cards/genres_card.js";
import SpotifyCard from "../shared/components/spotify_card.js";
import InlineGrid from "../components/inline_grid.js";
import Shelf from "../components/shelf.js";
import { spotifyApi } from "../../delulib/api.js";
import { chunkify50 } from "../../delulib/fp.js";
import { _, fp } from "../../std/deps.js";
import { DEFAULT_TRACK_IMG } from "../static.js";
const PlaylistAPI = S.Platform.getPlaylistAPI();
const { URI } = S;
const fetchAudioFeaturesMeta = async (ids) => {
    const featureList = {
        danceability: new Array(),
        energy: new Array(),
        key: new Array(),
        loudness: new Array(),
        mode: new Array(),
        speechiness: new Array(),
        acousticness: new Array(),
        instrumentalness: new Array(),
        liveness: new Array(),
        valence: new Array(),
        tempo: new Array(),
        time_signature: new Array(),
    };
    const audioFeaturess = await chunkify50(chunk => spotifyApi.tracks.audioFeatures(chunk))(ids);
    for (const audioFeatures of audioFeaturess) {
        for (const f of Object.keys(featureList)) {
            featureList[f].push(audioFeatures[f]);
        }
    }
    return _.mapValues(featureList, fp.mean);
};
const fetchArtistsMeta = async (ids) => {
    const idToMult = _(ids)
        .groupBy(_.identity)
        .mapValues(ids => ids.length)
        .value();
    const uniqIds = _.uniq(ids);
    const artistsRes = await chunkify50(chunk => spotifyApi.artists.get(chunk))(uniqIds);
    const genres = {};
    const artists = artistsRes.map(artist => {
        const multiplicity = idToMult[artist.id];
        for (const genre of artist.genres) {
            genres[genre] ??= 0;
            genres[genre] += multiplicity;
        }
        return {
            name: artist.name,
            uri: artist.uri,
            image: artist.images.at(-1).url ?? DEFAULT_TRACK_IMG,
            multiplicity,
        };
    });
    return { artists, genres };
};
const fetchAlbumsMeta = async (ids) => {
    const idToMult = _(ids)
        .groupBy(_.identity)
        .mapValues(ids => ids.length)
        .value();
    const uniqIds = _.uniq(ids);
    const albumsRes = await chunkify50(chunk => spotifyApi.albums.get(chunk))(uniqIds);
    const releaseYears = {};
    const albums = albumsRes.map(album => {
        const multiplicity = idToMult[album.id];
        const releaseYear = new Date(album.release_date).getYear() + 1900;
        releaseYears[releaseYear] ??= 0;
        releaseYears[releaseYear] += multiplicity;
        return {
            name: album.name,
            uri: album.uri,
            image: album.images.at(-1).url ?? DEFAULT_TRACK_IMG,
            releaseYear,
            multiplicity,
        };
    });
    return { albums, releaseYears };
};
const PlaylistPage = ({ uri }) => {
    const queryFn = async () => {
        const playlist = await PlaylistAPI.getPlaylist(uri);
        const { metadata, contents } = playlist;
        const getURI = ({ uri }) => uri;
        const toID = (uri) => URI.fromString(uri).id;
        const tracks = contents.items;
        const duration = tracks.map(track => track.duration.milliseconds).reduce(fp.add);
        const trackURIs = tracks.map(getURI);
        const trackIDs = trackURIs.map(toID);
        const audioFeatures = await fetchAudioFeaturesMeta(trackIDs);
        const artistObjs = tracks.flatMap(track => track.artists);
        const artistURIs = artistObjs.map(getURI);
        const artistIDs = artistURIs.map(toID);
        const { artists, genres } = await fetchArtistsMeta(artistIDs);
        const albumObjs = tracks.map(track => track.album);
        const albumURIs = albumObjs.map(getURI);
        const albumIDs = albumURIs.map(toID);
        const { albums, releaseYears } = await fetchAlbumsMeta(albumIDs);
        return { tracks, duration, audioFeatures, artists, genres, albums, releaseYears };
    };
    const { isLoading, error, data } = S.ReactQuery.useQuery({
        queryKey: ["playlistAnalysis"],
        queryFn,
    });
    if (isLoading) {
        return "Loading";
    }
    if (error) {
        console.error("SOS", error);
        return "Error";
    }
    if (!data) {
        return "WTF";
    }
    const { audioFeatures, artists, tracks, duration, genres, albums, releaseYears } = data;
    const statCards = Object.entries(audioFeatures).map(([key, value]) => {
        return S.React.createElement(StatCard, { label: key, value: value });
    });
    const artistCards = artists.map(artist => {
        return (S.React.createElement(SpotifyCard, { type: "artist", uri: artist.uri, header: artist.name, subheader: `Appears in ${artist.multiplicity} tracks`, imageUrl: artist.image }));
    });
    const albumCards = albums.map(album => {
        return (S.React.createElement(SpotifyCard, { type: "album", uri: album.uri, header: album.name, subheader: `Appears in ${album.multiplicity} tracks`, imageUrl: album.image }));
    });
    return (S.React.createElement("div", { className: "page-content encore-dark-theme encore-base-set" },
        S.React.createElement("section", { className: "stats-libraryOverview" },
            S.React.createElement(StatCard, { label: "Total Tracks", value: tracks.length }),
            S.React.createElement(StatCard, { label: "Total Artists", value: artists.length }),
            S.React.createElement(StatCard, { label: "Total Minutes", value: Math.floor(duration / 60) }),
            S.React.createElement(StatCard, { label: "Total Hours", value: duration / 60 / 60 })),
        S.React.createElement(Shelf, { title: "Most Frequent Genres" },
            S.React.createElement(GenresCard, { genres: genres }),
            S.React.createElement(InlineGrid, { special: true }, statCards)),
        S.React.createElement(Shelf, { title: "Most Frequent Artists" },
            S.React.createElement(InlineGrid, null, artistCards)),
        S.React.createElement(Shelf, { title: "Most Frequent Albums" },
            S.React.createElement(InlineGrid, null, albumCards)),
        S.React.createElement(Shelf, { title: "Release Year Distribution" },
            S.React.createElement(GenresCard, { genres: releaseYears }))));
};
export default React.memo(PlaylistPage);
