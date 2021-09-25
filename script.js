window.addEventListener('load', () => {
  console.log('Script running!');
});

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  // coloque seu código aqui
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function productListing(items) { // Mapeia a section e anexa os produtos
  const sectionItems = document.querySelector('.items'); // Aponta para a section
  items.forEach((item) => { // Percorre todos os itens adicionando-os a section
    const element = createProductItemElement(item);
    sectionItems.appendChild(element);
  });
}

async function getProductAPI() { // Carrega os dados do endpoint e guarda na variavel global
  try {
    const dataLoad = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador'); // Dados "brutos"
    const dataInJson = await dataLoad.json(); // Dados em formato json
    const products = dataInJson.results.map((product) => ({ // Criando um novo array somente com os dados necessarios
      sku: product.id,
      name: product.title,
      image: product.thumbnail,
    }));
    productListing(products); // Chama a função responsável por listar os produtos
  } catch (error) {
    console.log(error); // Se der erro, mostre-o.
  }
}

getProductAPI(); // Chama a função que faz a carga dos dados.

window.onload = () => { };
