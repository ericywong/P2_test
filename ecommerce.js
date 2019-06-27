import { Selector } from 'testcafe';
import { AngularJSSelector } from 'testcafe-angular-selectors';


fixture `Ecommerce Happy Path`
    .page `http://ecommerce-app.cosmicapp.co`;

//#region Selectors
const addToCartBadge      = Selector('span.badge');
const addToCartButton     = Selector('button.btn').withText(' Add to Cart');
const addToCartIcon       = Selector('a.btn.btn-primary.navbar-btn.navbar-right'); // There should really be an id here.
const checkoutButton      = Selector('a.btn.btn-primary.btn-lg').withText('Checkout');
const completeOrderButton = Selector('.btn.btn-primary').withText('Complete Order');
const filterSilver        = Selector('.list-group-item').withText('Silver');
const firstNestedProduct  = Selector('div.thumbnail');
const products            = AngularJSSelector.byRepeater('watch in vm.watches');
//#endregion

//#region Checkout Column Constants
const COLUMN_HASH  = '#';
const COLUMN_IMAGE = 'Image';
const COLUMN_MODEL = 'Model';
const COLUMN_BRAND = 'Brand';
const COLUMN_PRICE = 'Price';
//#endregion

//#region Order Form Selectors
const orderFormAddress    = Selector("input[name='address']");
const orderFormCity       = Selector("input[name='city']");
const orderFormEmail      = Selector("input[name='email']");
const orderFormFirstName  = Selector("input[name='firstName']");
const orderFormLastName   = Selector("input[name='lastName']");
const orderFormPhone      = Selector("input[name='phone']");
const orderFormPostalCode = Selector("input[name='postalCode']");
//#endregion

//#region Checkout Modal Selector
const modalCardNumber   = Selector("input[placeholder='Card number']");
const modalCVC          = Selector("input[placeholder='CVC']");
const modalEmail        = Selector("input[placeholder='Email']");
const modalExpiryDate   = Selector("input[placeholder='MM / YY']");
const modalSubmitButton = Selector('button.Button-animationWrapper-child--primary.Button').withText('Pay ');
const stripeModal       = Selector('div.ModalContainer')
//#endregion

/**
 * Tests are separated for clarity. These tests can also be extracted into
 * one test.
 */

test('test filter silver has products', async t => {
    console.log('Test silver products filter and make sure silve products exist.');

    await t
    .click(filterSilver)
    .expect(products.count).notEql(0);

    console.log('Success: test filter silver has products complete');
});

test('test add cart functionality', async t => {
    console.log('Test add to cart functionality.');
    await t
    .click(filterSilver)
    .click(firstNestedProduct)
    .click(addToCartButton)
    .expect(addToCartBadge.innerText).eql('1');

    console.log('Success: test add cart functionality complete');
}); 

test('test checkout and price accuracy', async t => {
    console.log('Test checkout system and accuracy of prices.');
    await t
    .click(filterSilver)
    .click(firstNestedProduct)
    .click(addToCartButton);

    let totalExpectedPrice = 0;

    // This testcase only selects the first product in the display
    // page. Other itme can be selected and their prices added to
    // confirm the checkout has no pricing errors.
    const itemOnedDisplayedPrice = await Selector('b.ng-binding').innerText;
   
    totalExpectedPrice += +itemOnedDisplayedPrice;
    
    await t
    .click(addToCartIcon);

    // Todo: Extract into reusable component.
    const table = Selector('table.table.table-striped');
    const rowCount = await table.find('tr').count;
    const columnCount = await table.find('tr').nth(0).find('th').count; 
    const priceColumn = await table.find('tr').nth(0).find('th').nth(4).textContent;
    let totalCheckoutPrice = 0;

    for (let i = 1; i < rowCount; i++) {
        if (priceColumn === COLUMN_PRICE) {
            let itemCheckoutPrice = await table.find('tr').nth(i).find('td').nth(4).textContent;
            totalCheckoutPrice += +itemCheckoutPrice;
        } 
    }

    console.log('Checking price accuracy');
    await t.expect(totalCheckoutPrice).eql(totalExpectedPrice);
    console.log('Success: total price of items in checkout are correct.')
    await t.click(checkoutButton);
    
    console.log('Completing order form.')
    await t
    .typeText(orderFormFirstName, 'Eric')
    .typeText(orderFormLastName, 'Wong')
    .typeText(orderFormAddress, '123 Sesame Street')
    .typeText(orderFormCity, 'Boston')
    .typeText(orderFormPostalCode, '02114')
    .typeText(orderFormPhone, '123-456-7890')
    .typeText(orderFormEmail, 'sesamestreettest@gamil.com')
    .click(completeOrderButton);

    console.log('Completeing stripe modal.')
    await t
    .switchToIframe("iframe[name='stripe_checkout_app']")
    .expect(stripeModal.exists).ok()
    .typeText(modalEmail, 'sesamestreettest@gmail.com')
    .typeText(modalCardNumber, '4242424242424242')
    .typeText(modalExpiryDate, '07/20')
    .typeText(modalCVC,'123')
    .click(modalSubmitButton)
    .expect(stripeModal.exists).notOk();

    console.log('Success: strip modal disappeared.');
    console.log('Success: test checkout and price accuracy complete.');
});