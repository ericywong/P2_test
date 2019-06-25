import { Selector } from 'testcafe';
import { AngularJSSelector, AngularSelector } from 'testcafe-angular-selectors';


fixture `Ecommerce Happy Path`
    .page `http://ecommerce-app.cosmicapp.co`;
// Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes
// TLS connections and HTTPS requests insecure by disabling certificate verification.

//#region Selectors
const addToCartBadge     = Selector('span.badge');
const addToCartButton    = Selector('button.btn').withText(' Add to Cart');
const addToCartIcon      = Selector('a').hre
const filterSilver       = Selector('.list-group-item').withText('Silver');
const firstNestedProduct = Selector('div.thumbnail');
const products           = AngularJSSelector.byRepeater('watch in vm.watches');
//#endregion

/**
 * Tests are separated for clarity. These tests can also be extracted into
 * one test.
 */
test('test filter silver has products', async t => {
    await t
    .click(filterSilver)
    .expect(products.count).notEql(0);
});

test('test add cart functionality', async t => {
    await t
    .click(filterSilver)
    .click(firstNestedProduct)
    .click(addToCartButton)
    .expect(addToCartBadge.innerText).eql('1');
});
// check if badge check will work if eql to 2 or 3.

test('test checkout and price accuracy', async t => {
    await t
    .click(filterSilver)
    .click(firstNestedProduct)
    .click(addToCartButton)

    const displayedPrice = await t.Selector('b.ng-binding').innerText;

    await t
    .

});