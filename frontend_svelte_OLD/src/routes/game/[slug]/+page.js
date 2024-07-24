/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    return {
        gameId: params.slug
    }
}