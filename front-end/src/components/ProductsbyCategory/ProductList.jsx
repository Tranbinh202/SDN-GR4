import { useNavigate } from "react-router-dom";

const ProductListByCategorys = ({ data, categories }) => {
  const getBrandName = (brandId) => {
    for (const category of categories) {
      const subCategory = category.sub_categories.find(sub => sub._id === brandId);
      if (subCategory) return subCategory.name;
    }
    return "Không xác định";
  };
  const navigate = useNavigate();
  return (
    <div className="list-product-container">
      <h2 className="list-product-title">Danh sách sản phẩm</h2>
      <div className="product-grid">
        {data?.map((product) => (
          <div key={product._id} className="product-card">
            <img
              src={product.images[0]}
              alt={product.name}
              className="product-image"
              onClick={() => navigate(`/product/${product._id}`)}
            />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>
                <strong>Thương hiệu:</strong> {getBrandName(product.brand)}
              </p>
              <p>
                <strong>Màu sắc:</strong> {product.colors.join(", ")}
              </p>
              <p>
                <strong>Giá từ:</strong>{" "}
                {new Intl.NumberFormat().format(product.variants[0].price)} VND
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListByCategorys;
